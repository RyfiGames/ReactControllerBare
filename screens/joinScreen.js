import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

import '../global';

export default function JoinScreen({ setScreen }, { socket }) {

  const [username, onChangeUsername] = useState('');
  const [pin, onChangePin] = useState('');

  const onPressJoin = () => {
    global.socket.emit('joinAttempt', username, pin, "controller");
    setScreen('wait');
  }

  return (
    <View style={styles.container3}>
      <Text style={styles.title}>Join a Game</Text>
      <TextInput
        style={styles.input}
        onChangeText={onChangeUsername}
        value={username}
        placeholder="Username"
      />
      <TextInput
        style={styles.input}
        onChangeText={onChangePin}
        value={pin}
        placeholder="Game Pin"
      />
      <Button
        onPress={onPressJoin}
        title="Join"      
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container3: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 30
  },
  input: {
    height: 40,
    width: 200,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
});
