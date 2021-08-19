import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ConnectionManager from './connectionManager';

import JoinScreen from './screens/joinScreen';
import WaitingScreen from './screens/waitingScreen';
import ControllerScreen from './screens/controllerScreen';
import DisconnectScreen from './screens/disconnectScreen';

const App = () => {

  const [screen, setScreen] = useState('join');
  const [socket, setSocket] = useState();
  
  useEffect(() => {
    ConnectionManager(setScreen);
  }, []);

  switch (screen) {
    case 'join':
      return (<JoinScreen setScreen={setScreen} />);
    case 'wait':
      return (<WaitingScreen setScreen={setScreen} />);
    case 'controller':
      return (<ControllerScreen setScreen={setScreen} />);
    case 'disconnect':
      return (<DisconnectScreen setScreen={setScreen} />);
  };
}
  
const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
