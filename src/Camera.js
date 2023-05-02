import React, { useRef, useEffect, useState } from "react";

function Camera() {
  const videoRef = useRef(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [deviceData, setDeviceData] = useState("");
  const [capabilitiesData, setCapabilitiesData] = useState("");

  const getPermissionForUserMedia = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    stream.getTracks().forEach((track) => track && track.stop());
  }

  useEffect(() => {
    getPermissionForUserMedia().then(() => {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );

        setDevices(videoDevices);

        // Search for preferred camera
        let backCameraWithWidestFOV;
        const cameraSearchTerms = ["Back Ultra Wide", "Back Wide", "Back"];
        for (let i = 0; i < cameraSearchTerms.length; i++) {
            const cameraDevices = videoDevices.filter((device) => device.label.includes(cameraSearchTerms[i]));
            if (cameraDevices.length > 0) {
                backCameraWithWidestFOV = cameraDevices[0];
                break;
            }
        }
        if (!backCameraWithWidestFOV) {
            backCameraWithWidestFOV = videoDevices[0];
        }
        setSelectedDeviceId(backCameraWithWidestFOV.deviceId);

        setDeviceData(JSON.stringify(devices, null, 2));
      });
    });
  }, []);

  useEffect(() => {
    const constraints = {
      audio: false,
      video: {
        deviceId: { exact: selectedDeviceId },
      },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        const videoElement = videoRef.current;
        videoElement.srcObject = stream;
        videoElement.play();
      })
      .catch((error) => {
        console.error(error);
      });
  }, [selectedDeviceId]);

  useEffect(() => {
    // Serialize the capabilities data for all cameras
    navigator.mediaDevices.enumerateDevices().then((devices) => {
      const capabilities = devices
        .filter((device) => device.kind === "videoinput")
        .map((device) => {
          if (device.getCapabilities) {
            return {
              deviceId: device.deviceId,
              label: device.label,
              capabilities: device.getCapabilities(),
            };
          } else {
            return {
              deviceId: device.deviceId,
              label: device.label,
              capabilities: {},
            };
          }
        });
      setCapabilitiesData(JSON.stringify(capabilities, null, 2));
    });
  }, []);

  const handleDeviceChange = (event) => {
    const deviceId = event.target.value.toString();
    setSelectedDeviceId(deviceId);
  };


  return (
    <div>
      <video ref={videoRef} playsInline style={{ width: "50%", height: "50%" }} />
      <div>
        <label htmlFor="device-select">Camera:</label>
        <select id="device-select" value={selectedDeviceId} onChange={handleDeviceChange}>
          {devices.map((device) => (
            <option key={device.deviceId} value={device.deviceId}>
              {device.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Device Data:</label>
    <textarea rows="10" value={deviceData} readOnly></textarea>
  </div>
  <div>
    <label>Capabilities Data:</label>
    <textarea rows="20" value={capabilitiesData} readOnly></textarea>
  </div>
</div>

);
}

export default Camera;