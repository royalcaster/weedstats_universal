import 'react-native-gesture-handler';
//Laut doku muss das im entry-file als aller erstes stehen, frag nicht

//React
import React, { useState, useEffect, useRef } from "react";
import { View, StatusBar, LogBox, Platform, StyleSheet, Text } from 'react-native'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';

//Service
import { UserContext } from "./src/data/UserContext";
import { LanguageContext } from "./src/data/LanguageContext";
import Languages from './src/data/languages.json'
import { FriendListContext } from "./src/data/FriendListContext";
import { ConfigContext } from "./src/data/ConfigContext";
import { app, firestore } from './src/data/FirebaseConfig'
import { doc, getDoc, updateDoc, deleteDoc, setDoc } from "@firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, deleteUser } from 'firebase/auth'
import { createUsernameArray, downloadUser } from "./src/data/Service";
import { ref, deleteObject } from '@firebase/storage'
import { storage } from "./src/data/FirebaseConfig";

//Expo
/* import { useFonts } from "expo-font"; */
/* import * as NavigationBar from 'expo-navigation-bar'
 import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants'; */

//Custom Components
/* import CustomLoader from "./src/components/common/CustomLoader"; */
/* import Login from './src/components/Login/Login' */
import Home from './src/components/Home/Home'
import { useBackHandler } from "@react-native-community/hooks";
import Authenticator from "./src/components/common/Authenticator";

import MapView from 'react-native-maps';

LogBox.ignoreLogs(['AsyncStorage has been extracted from react-native core and will be removed in a future release.']);

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={{color: "white"}}>Open up App.js to start working on your app!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
