const apiURL: string = import.meta.env.VITE_API_URL;

export const getTimerStatus = async () => {
  const response = await fetch(`${apiURL}/currentStatus`, {
    method: "GET",
  });
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const data: { isTimerRunning: boolean; elapsedTime: number } = await response.json();
  return data;
};