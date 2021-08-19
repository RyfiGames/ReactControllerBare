import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';

import { ResetConnection } from '../connectionManager';

import '../global'

export default function DisconnectScreen({ setScreen }) {

  const onPressBack = () => {
    ResetConnection();
    setScreen('join');
  }

  return (
    <View style={styles.container4}>
      <Text style={styles.title3}>Disconnected</Text>
      <Text style={styles.subtitle}>{ global.disconnectReason }</Text>
      <Button
        onPress={onPressBack}
        title="Back to Main"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container5: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title3: {
    fontSize: 30
  },
  subtitle: {
    fontSize: 20
  },
});
