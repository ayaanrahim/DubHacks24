import { Button, Card, IconButton } from "@radix-ui/themes";
import React, { useEffect, useMemo } from "react";
import useTimerStore from "../stores/useTimerStore";
import { Clock8, ListCheck, Play, Pause, RefreshCw } from "lucide-react";

export default function Timer() {
  const { time, isRunning, incrementTime, startTimer, stopTimer, resetTimer } =
    useTimerStore();

  const styles = {
    itemRow: {
      display: "flex",
      gap: "10px",
      alignItems: "center",
      width: "100%",
    },
    itemRowContent: {
      height: "100%",
      display: "flex",
      justifyContent: "center",
      flexDirection: "column",
    },
  };

  const formatTime = (timeInSeconds) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    // Pad single digit values with leading zero
    const pad = (value) => String(value).padStart(2, "0");

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const items = useMemo(
    () => [
      {
        Icon: Clock8,
        title: "Elapse Timed",
        value: formatTime(time),
      },
      {
        Icon: ListCheck,
        title: "Problems Solved",
        value: "0",
      },
    ],
    [time]
  );

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(incrementTime, 1000); // Increment every second
    } else if (!isRunning && time !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, incrementTime]);

  return (
    <Card
      className="shadow-md"
      style={{
        width: "100%",
        borderRadius: "6px",
        padding: "12px",
        gap: "8px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: "1px",
      }}>
      {items.map((item, index) => (
        <div style={styles.itemRow} key={index}>
          <item.Icon size={20} />
          <div style={styles.itemRowContent}>
            <div style={{ fontSize: "12px" }}>{item.title}</div>
            <div style={{ fontSize: "14px" }}>{item.value}</div>
          </div>
        </div>
      ))}
      <div />
      <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
        <Button onClick={() => (isRunning ? stopTimer() : startTimer())}>
          {isRunning ? <Pause size={12} /> : <Play size={12} />}
          {isRunning ? "Pause Timer" : "Start Timer"}
        </Button>
        <IconButton variant="soft" onClick={resetTimer}>
          <RefreshCw size={12} />
        </IconButton>
      </div>
    </Card>
  );
}
