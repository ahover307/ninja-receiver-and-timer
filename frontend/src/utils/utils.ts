export const formatMillisecondsToTimeString = (inputMilliseconds: number) => {
  const date = new Date(inputMilliseconds);
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const milliseconds = date.getUTCMilliseconds();

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds
      .toString()
      .padStart(3, "0")}`;
};
