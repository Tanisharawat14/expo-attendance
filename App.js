import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, BackHandler, Button, Alert, Text  } from 'react-native';
import { WebView } from 'react-native-webview';
import * as LocalAuthentication from 'expo-local-authentication';
 
const App = () => {
  const webViewRef = useRef(null); // To reference the WebView
  const [canGoBack, setCanGoBack] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ======== ANDROID HARDWARE BACKPRESS LOGIC

  // Handle back button press
  const onAndroidBackPress = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true; // Prevent the default back button behavior
    }
    return false; // Exit the app if no pages to go back to
  };

  useEffect(() => {
    // Attach the back handler listener when the component mounts
    BackHandler.addEventListener('hardwareBackPress', onAndroidBackPress);

    // Cleanup the listener when the component unmounts
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onAndroidBackPress);
    };
  }, [canGoBack]);

  // ================ ANDROID FINGERPRINT LOGIC =========================

  const authenticate = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      Alert.alert('Biometric authentication is not available on this device');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify Identity',
      fallbackLabel: 'Use Passcode',
    });

    if (result.success) {
      setAuthenticated(true);
      Alert.alert('Authentication successful!');
    } else {
      setErrorMessage(result.error || 'Authentication failed');
      Alert.alert('Authentication failed', result.error || 'Try again');
    }
  };


  return (
    <View style={styles.container}>
      {authenticated ? (
        <WebView 
        ref={webViewRef}
        source={{ uri: 'https://63d2-115-247-205-10.ngrok-free.app' }}
        style={styles.webview}
        onNavigationStateChange={(navState) => setCanGoBack(navState.canGoBack)}
        />
      ) : (
        <Button style={styles.authenticateBtn} title="Authenticate" onPress={authenticate} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    top: 40
  },
  webview: {
    flex: 1,
  },
  authenticateBtn: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default App;