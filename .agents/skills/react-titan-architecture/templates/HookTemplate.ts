import { useState, useEffect } from "react";

export function useFeatureData(id: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        // const result = await apiCall(id);
        if (active) {
          setData({ id, name: "Sample Data" });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      active = false;
    };
  }, [id]);

  return { data, loading };
}

export default useFeatureData;
