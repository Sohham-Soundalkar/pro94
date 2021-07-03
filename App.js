import React from 'react';
import { createAppContainer, createSwitchNavigator,} from 'react-navigation';

import WelcomeScreen from './screens/welcomescreen';
import { AppDrawerNavigator } from './components/appdrawernavigator'
import { AppTabNavigator } from './components/appTabNavigator'


export default function App() {
  return (
    <AppContainer/>
  );
}

 
const switchNavigator = createSwitchNavigator({
  WelcomeScreen:{screen: WelcomeScreen},
  Drawer:{screen: AppDrawerNavigator},
  BottomTab: {screen: AppTabNavigator},
})

const AppContainer =  createAppContainer(switchNavigator);
