"use client";

import * as React from "react";
import { Plus, Trash2, Download, Upload, Copy, FileDown, Eye, EyeOff } from "lucide-react";
import type { AdwallCard, RankingCell, RankingConfig } from "@/types/adwall";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  adminSmallButton,
  adminIconDestructiveButton,
  adminButtonSecondary,
} from "../admin-button-styles";
import { ensureMortgagePoorCreditBucket, getDefaultMortgageRankings } from "@/lib/mortgage-ranking-defaults";
import { Label } from "@/components/ui/label";

const DEFAULT_NEW_LENDER_RANK = 30;

function getRankingCellRank(cell: RankingCell | undefined): number | undefined {
  if (typeof cell === "number") return cell;
  return cell?.rank;
}

function isRankingCellHidden(cell: RankingCell | undefined): boolean {
  return typeof cell === "object" && cell !== null && cell.isHidden === true;
}

function createRankingCell(rank: number, isHidden: boolean): RankingCell {
  return isHidden ? { rank, isHidden: true } : rank;
}

interface MetricsEditorProps {
  rankingConfig: RankingConfig | null | undefined;
  cards?: AdwallCard[];
  funnelId: string;
  adwallType: string;
  onChange: (next: RankingConfig) => void;
  className?: string;
}

function getDefaultMortgageRankingConfig(): RankingConfig {
  return {
    dimensions: [
      {
        id: "creditScore",
        label: "Credit Score",
        buckets: [
          { id: "excellent", label: "Excellent (740+)" },
          { id: "good", label: "Good (680-739)" },
          { id: "fair", label: "Fair (620-679)" },
          { id: "poor", label: "Poor (<620)" },
        ],
      },
      {
        id: "loanAmount",
        label: "Loan Amount",
        buckets: [
          { id: "50-150", label: "$50K–$150K" },
          { id: "150-300", label: "$150K–$300K" },
          { id: "300-500", label: "$300K–$500K" },
          { id: "500-plus", label: "$500K+" },
        ],
      },
    ],
    lenders: {},
  };
}

interface GroupedColumn {
  groupLabel: string;
  subColumns: { label: string; key: string }[];
}

/**
 * Generate all combination keys from dimensions
 * For 2 dimensions: ["excellent:50-150", "excellent:150-300", ...]
 * For 3 dimensions: ["excellent:50-150:sedan", "excellent:50-150:suv", ...]
 */
function getAllCombinationKeys(dimensions: RankingConfig["dimensions"]): string[] {
  if (dimensions.length === 0) return [];
  if (dimensions.length === 1) {
    return dimensions[0]!.buckets.map((b) => b.id);
  }

  // Recursively generate combinations
  const [first, ...rest] = dimensions;
  const restCombos = getAllCombinationKeys(rest);

  const result: string[] = [];
  for (const bucket of first!.buckets) {
    for (const restCombo of restCombos) {
      result.push(`${bucket.id}:${restCombo}`);
    }
  }
  return result;
}

/**
 * Generate grouped columns for table display
 * Always groups by first dimension, sub-groups by remaining dimensions
 */
function getGroupedColumns(dimensions: RankingConfig["dimensions"]): GroupedColumn[] {
  if (dimensions.length === 0) return [];
  if (dimensions.length === 1) {
    // Single dimension: no grouping
    return [{
      groupLabel: "",
      subColumns: dimensions[0]!.buckets.map(b => ({
        label: b.label,
        key: b.id,
      })),
    }];
  }
  
  // Multi-dimensional: group by first dimension
  const [firstDim, ...restDims] = dimensions;
  const restCombos = getAllCombinationKeys(restDims);

  return firstDim!.buckets.map((bucket) => ({
    groupLabel: bucket.label,
    subColumns: restCombos.map((comboKey) => ({
      label: comboKey.split(":").map((id, idx) => {
        const dim = restDims[idx];
        const matchedBucket = dim?.buckets.find(b => b.id === id);
        return matchedBucket?.label || id;
      }).join(" × "),
      key: `${bucket.id}:${comboKey}`,
    })),
  }));
}

interface FunnelQuestion {
  fieldId: string;
  label: string;
  stepTitle: string;
  fieldLabel: string;
  hasOptions: boolean;
}

function useFunnelQuestions(funnelId: string) {
  const [questions, setQuestions] = React.useState<FunnelQuestion[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!funnelId) {
      setQuestions([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/funnel-configs/${funnelId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("not ok"))))
      .then((data: { steps?: Array<{ id?: string; title?: string; fields?: Array<{ id?: string; label?: string; options?: unknown[] }> }> }) => {
        if (cancelled) return;
        const excludedFieldIds = new Set([
          "firstname",
          "lastname",
          "first_name",
          "last_name",
          "fullname",
          "full_name",
          "name",
          "email",
        ]);
        const seenFieldIds = new Set<string>();
        const list: FunnelQuestion[] = [];
        for (const step of data.steps || []) {
          for (const field of step.fields || []) {
            if (!field?.id) continue;
            const normalizedFieldId = field.id.toLowerCase();
            if (excludedFieldIds.has(normalizedFieldId)) continue;
            if (seenFieldIds.has(normalizedFieldId)) continue;
            seenFieldIds.add(normalizedFieldId);
            const fieldLabel = (field.label || "").toString().trim();
            const stepTitle = (step.title || "").toString().trim();
            list.push({
              fieldId: field.id,
              label: fieldLabel || stepTitle || field.id,
              stepTitle,
              fieldLabel,
              hasOptions: Array.isArray(field.options) && field.options.length > 0,
            });
          }
        }
        setQuestions(list);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load funnel questions");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [funnelId]);

  return { questions, loading, error };
}

interface DimensionsManagerProps {
  dimensions: RankingConfig["dimensions"];
  onUpdate: (dimensions: RankingConfig["dimensions"]) => void;
  funnelId: string;
  adwallType: string;
}

function DimensionsManager({ dimensions, onUpdate, funnelId, adwallType }: DimensionsManagerProps) {
  const [loadingFieldOptions, setLoadingFieldOptions] = React.useState<number | null>(null);
  const [fieldOptionsError, setFieldOptionsError] = React.useState<string | null>(null);
  const { questions: funnelQuestions, loading: questionsLoading, error: questionsError } = useFunnelQuestions(funnelId);

  const addDimension = () => {
    const newDim: RankingConfig["dimensions"][0] = {
      id: `dimension${dimensions.length + 1}`,
      label: `Dimension ${dimensions.length + 1}`,
      fieldId: "",
      valueType: "direct",
      buckets: [
        { id: "bucket1", label: "Bucket 1" },
      ],
    };
    onUpdate([...dimensions, newDim]);
  };

  const removeDimension = (index: number) => {
    onUpdate(dimensions.filter((_, i) => i !== index));
  };

  const updateDimension = (index: number, updates: Partial<RankingConfig["dimensions"][0]>) => {
    const updated = dimensions.map((dim, i) => (i === index ? { ...dim, ...updates } : dim));
    onUpdate(updated);
  };

  const addBucket = (dimIndex: number) => {
    const dim = dimensions[dimIndex];
    if (!dim) return;

    const newBucket = {
      id: `bucket${dim.buckets.length + 1}`,
      label: `Bucket ${dim.buckets.length + 1}`,
    };

    updateDimension(dimIndex, {
      buckets: [...dim.buckets, newBucket],
    });
  };

  const removeBucket = (dimIndex: number, bucketIndex: number) => {
    const dim = dimensions[dimIndex];
    if (!dim) return;

    updateDimension(dimIndex, {
      buckets: dim.buckets.filter((_, i) => i !== bucketIndex),
    });
  };

  const updateBucket = (
    dimIndex: number,
    bucketIndex: number,
    updates: Partial<RankingConfig["dimensions"][0]["buckets"][0]>
  ) => {
    const dim = dimensions[dimIndex];
    if (!dim) return;

    const updatedBuckets = dim.buckets.map((bucket, i) =>
      i === bucketIndex ? { ...bucket, ...updates } : bucket
    );

    updateDimension(dimIndex, { buckets: updatedBuckets });
  };

  const fetchFieldOptions = async (dimIndex: number) => {
    const dim = dimensions[dimIndex];
    if (!dim || !dim.fieldId) {
      setFieldOptionsError("Please enter a Form Field ID first");
      return;
    }

    setLoadingFieldOptions(dimIndex);
    setFieldOptionsError(null);

    try {
      // Fetch the funnel config
      const response = await fetch(`/api/funnel-configs/${funnelId}`);
      if (!response.ok) {
        throw new Error("Failed to load funnel config");
      }

      const funnelConfig = await response.json();
      
      // Find the field in the funnel steps
      let fieldOptions: Array<{ value: string; label: string }> = [];
      
      for (const step of funnelConfig.steps || []) {
        for (const field of step.fields || []) {
          if (field.id === dim.fieldId && field.options) {
            fieldOptions = field.options;
            break;
          }
        }
        if (fieldOptions.length > 0) break;
      }

      if (fieldOptions.length === 0) {
        setFieldOptionsError(`No options found for field "${dim.fieldId}" in funnel`);
        return;
      }

      // Auto-create buckets from field options
      const newBuckets = fieldOptions.map((opt) => ({
        id: opt.value,
        label: opt.label,
        matchValues: [opt.value],
      }));

      updateDimension(dimIndex, { buckets: newBuckets });
    } catch {
      setFieldOptionsError("Failed to fetch field options from funnel");
    } finally {
      setLoadingFieldOptions(null);
    }
  };

  const loadMortgageDefaults = () => {
    const defaults = getDefaultMortgageRankings(adwallType);
    if (defaults) {
      onUpdate(defaults.dimensions);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-general-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm font-medium">Ranking Dimensions</div>
            <div className="text-xs text-general-muted-foreground mt-1">
              Define the questions/criteria that determine rankings. Each dimension has buckets (value ranges).
            </div>
          </div>
          <div className="flex items-center gap-2">
            {funnelId === "mortgage" && dimensions.length === 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={adminButtonSecondary}
                onClick={loadMortgageDefaults}
              >
                <Download className="h-4 w-4" />
                Load Mortgage Defaults
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={adminSmallButton}
              onClick={addDimension}
            >
              <Plus className="h-4 w-4" />
              Add Dimension
            </Button>
          </div>
        </div>

        {dimensions.length === 0 ? (
          <div className="border border-dashed border-general-border rounded-lg p-6 text-center text-sm text-general-muted-foreground">
            No dimensions configured. Click <span className="font-medium">Add Dimension</span> to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {dimensions.map((dim, dimIndex) => (
              <div key={dimIndex} className="border border-general-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 space-y-3">
                    {(dim.valueType || "direct") === "direct" ? (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Dimension ID (Funnel Question)</Label>
                            <select
                              value={
                                dim.id && funnelQuestions.some((q) => q.fieldId === dim.id)
                                  ? dim.id
                                  : dim.id
                                  ? "__custom__"
                                  : ""
                              }
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || value === "__custom__") {
                                  updateDimension(dimIndex, { id: value === "__custom__" ? dim.id || "" : "" });
                                  return;
                                }
                                const q = funnelQuestions.find((item) => item.fieldId === value);
                                if (!q) return;
                                updateDimension(dimIndex, {
                                  id: q.fieldId,
                                  fieldId: q.fieldId,
                                  label: q.label,
                                });
                              }}
                              disabled={questionsLoading}
                              className="h-8 w-full rounded-md border border-input bg-white px-2 text-xs shadow-xs outline-none hover:border-sg-primary-green disabled:pointer-events-none disabled:opacity-60"
                            >
                              <option value="">
                                {questionsLoading ? "Loading questions..." : "Select a funnel question"}
                              </option>
                              {funnelQuestions.map((q) => (
                                <option key={q.fieldId} value={q.fieldId}>
                                  {q.fieldId} — {q.label}
                                </option>
                              ))}
                              {dim.id && !funnelQuestions.some((q) => q.fieldId === dim.id) ? (
                                <option value="__custom__">{dim.id} (custom)</option>
                              ) : null}
                            </select>
                            {questionsError ? (
                              <div className="text-[11px] text-red-600">{questionsError}</div>
                            ) : null}
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Label</Label>
                            <Input
                              value={dim.label}
                              onChange={(e) => updateDimension(dimIndex, { label: e.target.value })}
                              className="h-8 text-xs"
                              placeholder="Auto-filled from funnel question"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Form Field ID</Label>
                            <Input
                              value={dim.fieldId || dim.id || ""}
                              readOnly
                              className="h-8 text-xs bg-[#fafafa] text-general-muted-foreground"
                              placeholder="Auto-filled from funnel question"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Value Type</Label>
                            <select
                              value={dim.valueType || "direct"}
                              onChange={(e) =>
                                updateDimension(dimIndex, {
                                  valueType: e.target.value as "direct" | "calculated",
                                })
                              }
                              className="w-full rounded-md border-[3px] border-input bg-white h-[55px] px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow,background-color,border-color] duration-200 ease-out outline-none hover:border-sg-primary-green hover:shadow-md cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="direct">Direct (from form field)</option>
                              <option value="calculated">Calculated</option>
                            </select>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Dimension ID</Label>
                            <Input
                              value={dim.id}
                              onChange={(e) => updateDimension(dimIndex, { id: e.target.value })}
                              className="h-8 text-xs"
                              placeholder="e.g., loanAmount"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Label</Label>
                            <Input
                              value={dim.label}
                              onChange={(e) => updateDimension(dimIndex, { label: e.target.value })}
                              className="h-8 text-xs"
                              placeholder="e.g., Loan Amount"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Form Field ID</Label>
                            <Input
                              value={dim.fieldId || ""}
                              onChange={(e) => updateDimension(dimIndex, { fieldId: e.target.value })}
                              className="h-8 text-xs"
                              placeholder="Leave empty to use dimension ID"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Value Type</Label>
                            <select
                              value={dim.valueType || "direct"}
                              onChange={(e) =>
                                updateDimension(dimIndex, {
                                  valueType: e.target.value as "direct" | "calculated",
                                })
                              }
                              className="w-full rounded-md border-[3px] border-input bg-white h-[55px] px-3 py-1 text-base md:text-sm shadow-xs transition-[color,box-shadow,background-color,border-color] duration-200 ease-out outline-none hover:border-sg-primary-green hover:shadow-md cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <option value="direct">Direct (from form field)</option>
                              <option value="calculated">Calculated</option>
                            </select>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Buckets ({dim.buckets.length})</Label>
                        <div className="flex items-center gap-2">
                          {dim.valueType === "direct" && dim.fieldId && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => fetchFieldOptions(dimIndex)}
                              disabled={loadingFieldOptions === dimIndex}
                              className="h-6 text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              {loadingFieldOptions === dimIndex ? "Loading..." : "Fetch from Funnel"}
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => addBucket(dimIndex)}
                            className="h-6 text-xs"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Bucket
                          </Button>
                        </div>
                      </div>

                      {fieldOptionsError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 rounded px-2 py-1 text-xs">
                          {fieldOptionsError}
                        </div>
                      )}

                      <div className="space-y-2">
                        {dim.buckets.map((bucket, bucketIndex) => (
                          <div key={bucketIndex} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                value={bucket.id}
                                onChange={(e) =>
                                  updateBucket(dimIndex, bucketIndex, { id: e.target.value })
                                }
                                className="h-7 text-xs flex-1"
                                placeholder={
                                  dim.valueType === "calculated"
                                    ? "Range (e.g., 50-150 or 500+)"
                                    : "Bucket ID (e.g., excellent)"
                                }
                              />
                              <Input
                                value={bucket.label}
                                onChange={(e) =>
                                  updateBucket(dimIndex, bucketIndex, { label: e.target.value })
                                }
                                className="h-7 text-xs flex-1"
                                placeholder={
                                  dim.valueType === "calculated"
                                    ? "Label (e.g., $50K-$150K)"
                                    : "Bucket Label (e.g., Excellent 740+)"
                                }
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeBucket(dimIndex, bucketIndex)}
                                className="h-7 w-7"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={adminIconDestructiveButton}
                    onClick={() => removeDimension(dimIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-800">
        <strong>Tip:</strong> After configuring dimensions, switch to &quot;Lender Rankings&quot; tab to set rankings
        for all dimension combinations. Number of combinations = {dimensions.reduce((acc, dim) => acc * dim.buckets.length, 1)}.
      </div>
    </div>
  );
}

export default function MetricsEditor({
  rankingConfig,
  funnelId,
  adwallType,
  onChange,
  className,
}: MetricsEditorProps) {
  const isMortgage = funnelId === "mortgage";

  const effectiveConfig = React.useMemo(() => {
    const baseConfig = rankingConfig ?? (isMortgage ? getDefaultMortgageRankingConfig() : { dimensions: [], lenders: {} });
    return isMortgage ? ensureMortgagePoorCreditBucket(baseConfig) : baseConfig;
  }, [rankingConfig, isMortgage]);

  const [showImportCSV, setShowImportCSV] = React.useState(false);
  const [showImportAdwall, setShowImportAdwall] = React.useState(false);
  const [csvFile, setCsvFile] = React.useState<File | null>(null);
  const [importError, setImportError] = React.useState<string | null>(null);
  const [availableAdwalls, setAvailableAdwalls] = React.useState<Array<{ id: string; label: string }>>([]);
  const [selectedAdwallId, setSelectedAdwallId] = React.useState("");

  const loadDefaults = () => {
    const defaults = getDefaultMortgageRankings(adwallType);
    if (defaults) {
      onChange(defaults);
    }
  };

  // Fetch available mortgage adwalls for import
  React.useEffect(() => {
    if (showImportAdwall && isMortgage) {
      fetch("/api/admin/adwalls?funnelId=mortgage")
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.adwalls)) {
            const options = data.adwalls
              .filter((aw: { id?: string; adwallType?: string; title?: string }) => aw.id !== `mortgage-${adwallType}`)
              .map((aw: { id?: string; adwallType?: string; title?: string }) => ({
                id: aw.id || "",
                label: `${(aw.adwallType || "").toUpperCase()} - ${aw.title || aw.id}`,
              }));
            setAvailableAdwalls(options);
          }
        })
        .catch(() => setAvailableAdwalls([]));
    }
  }, [showImportAdwall, isMortgage, adwallType]);

  const groupedColumns = React.useMemo(
    () => getGroupedColumns(effectiveConfig.dimensions),
    [effectiveConfig.dimensions]
  );

  const lenderNames = React.useMemo(
    () => Object.keys(effectiveConfig.lenders),
    [effectiveConfig.lenders]
  );

  const addLender = () => {
    let nextIndex = lenderNames.length + 1;
    let newName = `Lender ${nextIndex}`;
    while (effectiveConfig.lenders[newName]) {
      nextIndex += 1;
      newName = `Lender ${nextIndex}`;
    }
    const newLenderRankings: Record<string, RankingCell> = {};
    
    // Start new lenders below existing prioritized rows until the user edits them.
    const allKeys = getAllCombinationKeys(effectiveConfig.dimensions);
    for (const key of allKeys) {
      newLenderRankings[key] = DEFAULT_NEW_LENDER_RANK;
    }

    onChange({
      ...effectiveConfig,
      lenders: {
        [newName]: newLenderRankings,
        ...effectiveConfig.lenders,
      },
    });
  };

  const removeLender = (lenderName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [lenderName]: _, ...rest } = effectiveConfig.lenders;
    onChange({
      ...effectiveConfig,
      lenders: rest,
    });
  };

  const [editingLenderName, setEditingLenderName] = React.useState<string | null>(null);
  const [tempLenderName, setTempLenderName] = React.useState("");

  const updateLenderName = (oldName: string, newName: string) => {
    if (!newName.trim() || newName === oldName) {
      setEditingLenderName(null);
      return;
    }

    const { [oldName]: rankings, ...rest } = effectiveConfig.lenders;
    onChange({
      ...effectiveConfig,
      lenders: {
        ...rest,
        [newName.trim()]: rankings ?? {},
      },
    });
    setEditingLenderName(null);
  };

  const [editingCell, setEditingCell] = React.useState<string | null>(null);
  const [tempRankValue, setTempRankValue] = React.useState("");

  const updateRank = (lenderName: string, comboKey: string, rank: string) => {
    const parsed = parseInt(rank, 10);
    const value = Number.isNaN(parsed) || parsed < 1 ? DEFAULT_NEW_LENDER_RANK : parsed;
    const existingCell = effectiveConfig.lenders[lenderName]?.[comboKey];
    const isHidden = isRankingCellHidden(existingCell);

    onChange({
      ...effectiveConfig,
      lenders: {
        ...effectiveConfig.lenders,
        [lenderName]: {
          ...(effectiveConfig.lenders[lenderName] ?? {}),
          [comboKey]: createRankingCell(value, isHidden),
        },
      },
    });
    setEditingCell(null);
  };

  const toggleCellVisibility = (lenderName: string, comboKey: string) => {
    const existingCell = effectiveConfig.lenders[lenderName]?.[comboKey];
    const rank = getRankingCellRank(existingCell) ?? DEFAULT_NEW_LENDER_RANK;
    const nextHidden = !isRankingCellHidden(existingCell);

    onChange({
      ...effectiveConfig,
      lenders: {
        ...effectiveConfig.lenders,
        [lenderName]: {
          ...(effectiveConfig.lenders[lenderName] ?? {}),
          [comboKey]: createRankingCell(rank, nextHidden),
        },
      },
    });
  };

  const downloadCSV = () => {
    const comboKeys = getAllCombinationKeys(effectiveConfig.dimensions);
    const escapeCSVValue = (value: string | number) => {
      const stringValue = String(value);
      return /[",\n\r]/.test(stringValue)
        ? `"${stringValue.replace(/"/g, '""')}"`
        : stringValue;
    };
    const rows = [
      ["Lender", ...comboKeys],
      ...lenderNames.map((lenderName) => {
        const rankings = effectiveConfig.lenders[lenderName] ?? {};
        return [
          lenderName,
          ...comboKeys.map((comboKey) => getRankingCellRank(rankings[comboKey]) ?? DEFAULT_NEW_LENDER_RANK),
        ];
      }),
    ];
    const csv = rows
      .map((row) => row.map(escapeCSVValue).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${funnelId}-${adwallType}-ranking-matrix.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportCSV = () => {
    if (!csvFile) return;
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split("\n").filter((line) => line.trim());
        
        if (lines.length < 2) {
          setImportError("CSV file must have a header row and at least one data row");
          return;
        }

        const headers = lines[0]!.split(",").map((h) => h.trim());
        const lenderNameIndex = headers.findIndex((h) => h.toLowerCase() === "lender" || h.toLowerCase() === "lender name");
        
        if (lenderNameIndex === -1) {
          setImportError("CSV must have a 'Lender' or 'Lender Name' column");
          return;
        }

        const newLenders: RankingConfig["lenders"] = {};

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i]!.split(",").map((v) => v.trim());
          const lenderName = values[lenderNameIndex];
          
          if (!lenderName) continue;

          const rankings: Record<string, RankingCell> = {};
          
          // Map CSV columns to combo keys
          for (let j = 0; j < headers.length; j++) {
            if (j === lenderNameIndex) continue;
            
            const header = headers[j]!;
            const value = values[j];
            const rank = parseInt(value || "1", 10);
            
            if (!Number.isNaN(rank) && rank >= 1) {
              // Try to match header to combo key format
              rankings[header] = rank;
            }
          }

          newLenders[lenderName] = rankings;
        }

        onChange({
          ...effectiveConfig,
          lenders: newLenders,
        });

        setShowImportCSV(false);
        setCsvFile(null);
      } catch {
        setImportError("Failed to parse CSV file. Please check the format.");
      }
    };

    reader.readAsText(csvFile);
  };

  const handleImportFromAdwall = async () => {
    if (!selectedAdwallId) return;
    setImportError(null);

    try {
      const response = await fetch(`/api/admin/adwalls/${selectedAdwallId}`);
      const data = await response.json();
      
      if (data.config?.draft?.rankingConfig) {
        onChange(data.config.draft.rankingConfig);
        setShowImportAdwall(false);
        setSelectedAdwallId("");
      } else {
        setImportError("Selected adwall does not have ranking configuration");
      }
    } catch {
      setImportError("Failed to import rankings from selected adwall");
    }
  };

  if (!isMortgage) {
    return (
      <div className={cn("bg-white border border-general-border rounded-lg p-6", className)}>
        <div className="text-sm text-general-muted-foreground">
          Matrix is currently only supported for mortgage funnels. Generic funnel support coming soon.
        </div>
      </div>
    );
  }

  if (effectiveConfig.dimensions.length === 0) {
    return (
      <div className={cn("bg-white border border-general-border rounded-lg p-6", className)}>
        <div className="text-sm text-general-muted-foreground">
          No ranking dimensions configured. Please configure dimensions before adding lenders.
        </div>
      </div>
    );
  }

  const hasDefaults = isMortgage && getDefaultMortgageRankings(adwallType) !== null;
  // Temporarily hide the dimension configuration UI and show only the ranking matrix.
  const showDimensionsEditor = false;

  return (
    <TooltipProvider>
    <div className={cn("space-y-4", className)}>
      {showDimensionsEditor ? (
        <DimensionsManager
          dimensions={effectiveConfig.dimensions}
          onUpdate={(dimensions) => onChange({ ...effectiveConfig, dimensions })}
          funnelId={funnelId}
          adwallType={adwallType}
        />
      ) : (
        <div className="bg-white border border-general-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm font-medium">Lender Rankings</div>
              <div className="text-xs text-general-muted-foreground mt-1">
                Configure rankings for each lender across all dimension combinations
              </div>
            </div>
            <TooltipProvider>
              <div className="flex items-center gap-2">
                {hasDefaults && lenderNames.length === 0 && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className={cn(adminButtonSecondary, "h-9 w-9 px-0")}
                        onClick={loadDefaults}
                        aria-label="Load defaults"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Load defaults</TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className={cn(adminButtonSecondary, "h-9 w-9 px-0")}
                      onClick={downloadCSV}
                      disabled={lenderNames.length === 0}
                      aria-label="Download CSV"
                    >
                      <FileDown className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download CSV</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className={cn(adminButtonSecondary, "h-9 w-9 px-0")}
                      onClick={() => setShowImportCSV(true)}
                      aria-label="Import CSV"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Import CSV</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className={cn(adminButtonSecondary, "h-9 w-9 px-0")}
                      onClick={() => setShowImportAdwall(true)}
                      aria-label="Import from adwall"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Import from adwall</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      className={cn(adminButtonSecondary, "h-9 w-9 px-0")}
                      onClick={addLender}
                      aria-label="Add lender"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add lender</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
        </div>

        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 text-xs text-blue-800">
          <strong>Note:</strong> Rankings determine the order in which lenders appear on the adwall.
          Lower numbers appear first (1 = highest priority).
        </div>

        {lenderNames.length === 0 ? (
          <div className="border border-dashed border-general-border rounded-lg p-6 text-center text-sm text-general-muted-foreground">
            No lenders added yet. Click <span className="font-medium">Add Lender</span> to create the first one.
          </div>
        ) : (
          <div className="border border-general-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#fafafa] border-b border-general-border">
                  {effectiveConfig.dimensions.length === 1 ? (
                    // Single dimension: simple header
                    <tr>
                      <th className="sticky left-0 z-20 bg-[#fafafa] px-3 py-2 text-left font-medium text-xs whitespace-nowrap border-r border-general-border">
                        Lender Name
                      </th>
                      {groupedColumns[0]?.subColumns.map((subCol) => (
                        <th key={subCol.key} className="px-3 py-2 text-center font-medium text-xs whitespace-nowrap min-w-[100px]">
                          {subCol.label}
                        </th>
                      ))}
                      <th className="sticky right-0 z-20 bg-[#fafafa] px-3 py-2 text-center font-medium text-xs w-[60px] border-l border-general-border">
                        Actions
                      </th>
                    </tr>
                  ) : (
                    // Multi-dimensional: grouped headers
                    <>
                      <tr>
                        <th
                          rowSpan={2}
                          className="sticky left-0 z-20 bg-[#fafafa] px-3 py-2 text-left font-medium text-xs whitespace-nowrap border-r border-general-border"
                        >
                          Lender Name
                        </th>
                        {groupedColumns.map((group) => (
                          <th
                            key={group.groupLabel}
                            colSpan={group.subColumns.length}
                            className="px-3 py-2 text-center font-semibold text-xs border-r border-general-border"
                          >
                            {group.groupLabel}
                          </th>
                        ))}
                        <th
                          rowSpan={2}
                          className="sticky right-0 z-20 bg-[#fafafa] px-3 py-2 text-center font-medium text-xs w-[60px] border-l border-general-border"
                        >
                          Actions
                        </th>
                      </tr>
                      <tr>
                        {groupedColumns.map((group) =>
                          group.subColumns.map((subCol, idx) => (
                            <th
                              key={subCol.key}
                              className={cn(
                                "px-3 py-2 text-center font-medium text-xs whitespace-nowrap min-w-[100px]",
                                idx === group.subColumns.length - 1 && "border-r border-general-border"
                              )}
                            >
                              {subCol.label}
                            </th>
                          ))
                        )}
                      </tr>
                    </>
                  )}
                </thead>
                <tbody className="divide-y divide-general-border">
                  {lenderNames.map((lenderName) => {
                    const rankings = effectiveConfig.lenders[lenderName] ?? {};
                    const isEditing = editingLenderName === lenderName;
                    const displayValue = isEditing ? tempLenderName : lenderName;
                    
                    return (
                      <tr key={lenderName} className="hover:bg-[#fafafa]">
                        <td className="sticky left-0 z-10 bg-white px-3 py-2 border-r border-general-border">
                          <Input
                            value={displayValue}
                            onFocus={() => {
                              setEditingLenderName(lenderName);
                              setTempLenderName(lenderName);
                            }}
                            onChange={(e) => setTempLenderName(e.target.value)}
                            onBlur={(e) => updateLenderName(lenderName, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                updateLenderName(lenderName, e.currentTarget.value);
                              } else if (e.key === "Escape") {
                                setEditingLenderName(null);
                                setTempLenderName("");
                              }
                            }}
                            className="h-8 text-xs font-medium"
                            placeholder="Lender name"
                          />
                        </td>
                        {groupedColumns.map((group) =>
                          group.subColumns.map((subCol, idx) => {
                            const cellKey = `${lenderName}:${subCol.key}`;
                            const isEditingThisCell = editingCell === cellKey;
                            const currentCell = rankings[subCol.key];
                            const currentRank = getRankingCellRank(currentCell) ?? DEFAULT_NEW_LENDER_RANK;
                            const isHidden = isRankingCellHidden(currentCell);
                            const displayValue = isEditingThisCell ? tempRankValue : String(currentRank);
                            
                            return (
                              <td
                                key={subCol.key}
                                className={cn(
                                  "px-3 py-2",
                                  isHidden && "bg-slate-50",
                                  idx === group.subColumns.length - 1 && "border-r border-general-border"
                                )}
                              >
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    value={displayValue}
                                    onFocus={() => {
                                      setEditingCell(cellKey);
                                      setTempRankValue(String(currentRank));
                                    }}
                                    onChange={(e) => setTempRankValue(e.target.value)}
                                    onBlur={(e) => updateRank(lenderName, subCol.key, e.target.value)}
                                    onWheel={(e) => e.currentTarget.blur()}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        updateRank(lenderName, subCol.key, e.currentTarget.value);
                                      } else if (e.key === "Escape") {
                                        setEditingCell(null);
                                        setTempRankValue("");
                                      }
                                    }}
                                    className={cn("h-8 text-xs text-center", isHidden && "text-general-muted-foreground")}
                                  />
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className={cn(
                                          "h-8 w-8 shrink-0",
                                          isHidden ? "text-general-muted-foreground" : "text-sg-primary-green"
                                        )}
                                        onClick={() => toggleCellVisibility(lenderName, subCol.key)}
                                        aria-label={
                                          isHidden
                                            ? `Show ${lenderName} for ${subCol.label}`
                                            : `Hide ${lenderName} for ${subCol.label}`
                                        }
                                      >
                                        {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>{isHidden ? "Hidden for this option" : "Shown for this option"}</TooltipContent>
                                  </Tooltip>
                                </div>
                              </td>
                            );
                          })
                        )}
                        <td className="sticky right-0 z-10 bg-white px-3 py-2 text-center border-l border-general-border">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={adminIconDestructiveButton}
                            onClick={() => removeLender(lenderName)}
                            aria-label={`Remove ${lenderName}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
      )}

      {/* Import CSV Panel */}
      {showImportCSV && (
        <div className="bg-white border border-general-border rounded-lg p-4 space-y-4">
          <div>
            <div className="text-sm font-medium">Import Lenders from CSV</div>
            <div className="text-xs text-general-muted-foreground mt-1">
              Upload a CSV file with lender rankings. The file should have a &quot;Lender&quot; or &quot;Lender Name&quot; column,
              an optional &quot;Ranking number&quot; column, followed by columns matching your dimension combinations (e.g., &quot;excellent:50-150&quot;).
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file" className="text-xs">CSV File</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={(e) => {
                  setCsvFile(e.target.files?.[0] || null);
                  setImportError(null);
                }}
                className="text-xs"
              />
            </div>
            
            {importError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs">
                {importError}
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-800">
              <strong>CSV Format Example:</strong>
              <pre className="mt-2 text-[10px] overflow-x-auto">
{`Lender,Ranking number,excellent:50-150,excellent:150-300,...
Quicken Loans,9.6,13,13,...
Figure,8.6,2,2,...`}
              </pre>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={adminButtonSecondary}
              onClick={() => {
                setShowImportCSV(false);
                setCsvFile(null);
                setImportError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className={adminSmallButton}
              onClick={handleImportCSV}
              disabled={!csvFile}
            >
              Import
            </Button>
          </div>
        </div>
      )}

      {/* Import from Adwall Panel */}
      {showImportAdwall && (
        <div className="bg-white border border-general-border rounded-lg p-4 space-y-4">
          <div>
            <div className="text-sm font-medium">Import Rankings from Another Adwall</div>
            <div className="text-xs text-general-muted-foreground mt-1">
              Copy ranking configuration from another mortgage adwall. This will replace your current rankings.
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adwall-select" className="text-xs">Select Adwall</Label>
              <select
                id="adwall-select"
                value={selectedAdwallId}
                onChange={(e) => {
                  setSelectedAdwallId(e.target.value);
                  setImportError(null);
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">Choose an adwall...</option>
                {availableAdwalls.map((aw) => (
                  <option key={aw.id} value={aw.id}>
                    {aw.label}
                  </option>
                ))}
              </select>
            </div>
            
            {importError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs">
                {importError}
              </div>
            )}
            
            {availableAdwalls.length === 0 && (
              <div className="text-xs text-general-muted-foreground">
                No other mortgage adwalls found.
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className={adminButtonSecondary}
              onClick={() => {
                setShowImportAdwall(false);
                setSelectedAdwallId("");
                setImportError(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className={adminSmallButton}
              onClick={handleImportFromAdwall}
              disabled={!selectedAdwallId}
            >
              Import
            </Button>
          </div>
        </div>
      )}
    </div>
    </TooltipProvider>
  );
}
