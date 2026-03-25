declare module "zipcodes" {
  const zipcodes: {
    lookup: (zip: string) => unknown;
  };
  export default zipcodes;
}

