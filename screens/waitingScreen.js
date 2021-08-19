import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

import { ResetConnection } from '../connectionManager';

export default function WaitingScreen({ setScreen }) {

  const onPressBack = () => {
    ResetConnection();
    setScreen('join');
  }

  return (
    <View style={styles.container4}>
      <Text style={styles.title1}>Waiting for the host to accept...</Text>
      <Button
        onPress={onPressBack}
        title="Back"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container4: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title1: {
    fontSize: 30
  },
});
