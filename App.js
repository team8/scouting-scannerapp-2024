import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const scannedRef = useRef(false);
  const lastScannedTimestampRef = useRef(0);
  // bumping this remounts CameraView, which re-requests the camera stream (needed on web)
  const [cameraKey, setCameraKey] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // browsers kill the camera stream when the tab is hidden, so restart it when we come back
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setCameraKey((k) => k + 1);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="grant permission" />
      </View>
    );
  }
  const scanAgain = () => {
    scannedRef.current = false;
    setScanned(false);
    setCameraKey((k) => k + 1);
  };

  const handleBarCodeScanned = ({type, data}) => {
    const timestamp = Date.now();
    
    if (scannedRef.current || (timestamp - lastScannedTimestampRef.current < 2000)) {
      //change that 2000 (2 seconds) for whatever value you want 
      return
    }
    scannedRef.current = true;
    setScanned(true);
    console.log(data)
    lastScannedTimestampRef.current = timestamp;
    
    fetch(`https://server.palyrobotics.com/data-collection/add-data`, { method: `POST`, headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({"raw": data}) })
      .then((response) => {
        console.log(response.text())
        alert('Success!!');
      })
      .catch((error) => {
        alert(error)
        console.log(error.stack)
      });
  };

  return (
    <View style={styles.container}>
      <CameraView key={cameraKey} barcodeScannerSettings={{
    barcodeTypes: ["qr"],
    interval: 1000
  }} style={styles.camera} facing={"back"} onBarcodeScanned={handleBarCodeScanned}>
        <View style={styles.buttonContainer}>
          {scanned && 
          <TouchableOpacity style={styles.button} onPress={scanAgain}>
            <Text style={styles.text}>Scan Again</Text>
          </TouchableOpacity>
}
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
});
