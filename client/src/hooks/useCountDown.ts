import { useEffect, useState } from "react";

const useCountDown = (countdown: number = 60) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  function startCountDown() {
    setTimeLeft(countdown);
  }

  return { startCountDown, timeLeft };
};

export default useCountDown;
