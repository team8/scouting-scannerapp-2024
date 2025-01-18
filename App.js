import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function App() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const lastScannedTimestampRef = useRef(0);


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
  const handleBarCodeScanned = ({type, data}) => {
    setScanned(true);
    console.log(data)
    const timestamp = Date.now();
    
    if (scanned || (timestamp - lastScannedTimestampRef.current < 2000)) {
      //change that 2000 (2 seconds) for whatever value you want 
      return
    }
    lastScannedTimestampRef.current = timestamp;
    
    fetch(`http://10.245.28.33:4000/data-collection/add-data`, { method: `POST`, headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({"raw": data}) })
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
      <CameraView barcodeScannerSettings={{
    barcodeTypes: ["qr"],
    interval: 1000
  }} style={styles.camera} facing={"back"} onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}>
        <View style={styles.buttonContainer}>
          {scanned && 
          <TouchableOpacity style={styles.button} onPress={() => setScanned(false)}>
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
