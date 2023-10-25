import { useDvdScreensaver } from "react-dvd-screensaver";
import "./Display.css";
import { displayScrollSpeed, timerSleepDelay } from "../Constants/Env.ts";
import {
  RealtimeChannel,
  SupabaseClient,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { useTimer } from "react-use-precision-timer";
import { formatMillisecondsToTimeString } from "../utils/utils.ts";

type Props = {
  supabase: SupabaseClient;
};

type Timer = {
  id: number;
  location: string;
  startTime: string;
  endTime: string;
  isRunning: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string;
};

export const Display = (props: Props) => {
  const { location } = useParams();
  const [channel, setChannel] = useState<RealtimeChannel>();
  const [timer, setTimer] = useState<Timer>();
  const [timeElapsedOnTimer, setTimeElapsedOnTimer] = useState(0);

  const uiTimer = useTimer(
    { delay: timerSleepDelay },
    useCallback(() => {
      setTimeElapsedOnTimer(uiTimer.getElapsedRunningTime());
    }, []),
  );

  const startTimer = (startTime?: number) => {
    uiTimer.start(startTime);
  };

  const stopTimer = () => {
    uiTimer.stop();
  };

  const getData = async () => {
    const { data } = await props.supabase
      .from("timers")
      .select()
      .eq("location", location)
      .single();

    const channel = props.supabase
      .channel("timers")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: `timers`,
          filter: `location=eq.${location}`,
        },
        (payload: RealtimePostgresChangesPayload<Timer>) => {
          setTimer(payload.new as Timer);
          console.log(payload);
          console.log(payload.new);
        },
      )
      .subscribe();

    setTimer(data);
    setChannel(channel);
  };

  useEffect(() => {
    if (props.supabase) {
      getData();
    }

    return () => {
      if (props.supabase && channel) {
        props.supabase.removeChannel(channel);
      }
    };
  }, [props.supabase]);

  useEffect(() => {
    if (timer) {
      if (timer.isRunning) {
        // If the time is in the future, start the timer now, and it can be slid later
        // Needed because supabase functions seem to be running 2 seconds in the future?
        // This will work because the server computes the end times consistently even if this is "technically" off
        if (new Date(timer.startTime).getTime() > new Date().getTime()) {
          startTimer();
        } else {
          startTimer(new Date(timer.startTime).getTime());
        }
      } else {
        stopTimer();
        if (timer.startTime && timer.endTime) {
          setTimeElapsedOnTimer(
            new Date(timer.endTime).getTime() -
              new Date(timer.startTime).getTime(),
          );
        } else {
          setTimeElapsedOnTimer(0);
        }
      }
    }
  }, [timer]);

  const { containerRef, elementRef } = useDvdScreensaver({
    speed: displayScrollSpeed,
  });

  return (
    <div className={"display"}>
      {/* @ts-ignore */}
      <div ref={containerRef} className={"display-container"}>
        {/* @ts-ignore */}
        <div ref={elementRef} className={"display-element"}>
          {formatMillisecondsToTimeString(timeElapsedOnTimer)}
        </div>
      </div>
    </div>
  );
};
