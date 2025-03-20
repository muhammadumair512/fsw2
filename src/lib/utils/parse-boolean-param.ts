export const parseBooleanParam = (param: string | null) => {
  if (param === 'true') return true;
  if (param === 'false') return false;

  return undefined;
};
