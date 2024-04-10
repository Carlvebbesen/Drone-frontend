"use client";
import React, { useRef, useEffect, useState } from "react";
import { SocketLogger } from "../control/socketLogger";
import { useVideoLogger } from "@/hooks/useVideoLogger";

export const VideoStream = () => {
  // useEffect(() => {
  //   if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  //     navigator.mediaDevices
  //       .getUserMedia({ video: true })
  //       .then((stream) => {
  //         if (videoRef.current) {
  //           videoRef.current.srcObject = stream;
  //         }
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //       });
  //   }
  // }, []);
  const { videoLog } = useVideoLogger();
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    // Find the latest "image_data" type message in the videoLog
    const imageData = videoLog.find((log) => log.type === "command");
    if (imageData && imageData.msg) {
      setImageSrc(imageData.msg);
    }
  }, [videoLog]);

  return (
    <div>
      {/* Display the image using the base64 string stored in imageSrc */}
      {imageSrc && (
        <img
          src={`data:image/jpeg;base64,${imageSrc}`}
          alt="Video Stream"
          style={{ width: "100%" }}
        />
      )}
    </div>
  );
};
