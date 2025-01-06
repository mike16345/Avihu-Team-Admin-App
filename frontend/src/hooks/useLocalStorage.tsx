import React, { useEffect } from "react";

const useLocalStorage = (key: string) => {
  const [value, setValue] = React.useState();

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, setValue]);

  return [value, setValue];
};

export default useLocalStorage;
