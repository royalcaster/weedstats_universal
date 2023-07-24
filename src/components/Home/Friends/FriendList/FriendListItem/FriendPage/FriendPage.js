//React
import React, { useContext, useEffect, useRef, useState } from "react";
import { Animated, Easing, View, StyleSheet, Dimensions, Text, Image, TouchableNativeFeedback, Modal, PanResponder, ScrollView } from "react-native";

//Custom Components
import BackButton from "../../../../../common/BackButton";
import CustomLoader from "../../../../../common/CustomLoader";
import ProfileImagePanel from '../../../../../common/ProfileImagePanel'
import Button from "../../../../../common/Button";
import IconButton from "../../../../../common/IconButton";
import CustomMarker from "../../../../../common/CustomMarker";
import CustomModal from "../../../../../common/CustomModal";

//Third Party
import { responsiveHeight, responsiveFontSize, responsiveWidth } from "react-native-responsive-dimensions";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AntDesign from 'react-native-vector-icons/AntDesign'
import MapView, { Marker, PROVIDER_GOOGLE }  from "react-native-maps";

//Konstanten
import levels from "../../../../../../data/Levels.json";

//Firebase
import { doc, getDoc, updateDoc } from "@firebase/firestore";
import { firestore } from "../../../../../../data/FirebaseConfig";

//Service
import {UserContext} from '../../../../../../data/UserContext'
import { LanguageContext } from "../../../../../../data/LanguageContext";
import { useBackHandler } from "@react-native-community/hooks";
import { LinearGradient } from "expo-linear-gradient";
import { downloadUser } from '../../../../../../data/Service'
import { ConfigContext } from '../../../../../../data/ConfigContext'
import toGermanDate from "../../../../../../data/DateConversion";
import { mapStyle } from "../../../../../../data/CustomMapStyle";
import { uuidv4 } from "@firebase/util";
import TypeImage from "../../../../../common/TypeImage";
import Empty from "../../../../../common/Empty";
import MemberSince from "../../../../../common/MemberSince";

const FriendPage = ({ show, user, onExit, refreshUser, onRemoveFriend }) => {

  //Context
  const language = useContext(LanguageContext);
  const realuser = useContext(UserContext);
  const config = useContext(ConfigContext);
    
  //Constants
  const screen_width = Dimensions.get("screen").width;
  const switch_icon = <AntDesign name={"picture"} style={{fontSize: 20, color: "white"}}/>

  //State
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [showProfilePicture, setShowProfilePicture] = useState(false);
  const [friendConfig, setFriendConfig] = useState();
  const [showMap, setShowMap] = useState(false);
  const [mapType, setMapType] = useState("standard");

  //Refs
  const pan = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(screen_width)).current;
  const slideAnim2 = useRef(new Animated.Value(-20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim2 = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef();


  useEffect(() => {
    if (user) {
      getFriendConfig();
    }
  },[user]);

  useEffect(() => {
    if (!show) {
  
    }
    if (show && (user != null)) {
      setLoading(false);
    }
  }, [show]);

  useBackHandler(() => {
    onExit(); 
    hide();
    return true;
  });

  const getFriendConfig = async () => {
    const config = await downloadUser(user.id, true);
    setFriendConfig(config);
    setLoading(false);
  }

  const slideCounters = () => {
    slideAnim2.setValue(-50);
    opacityAnim.setValue(0);
    opacityAnim2.setValue(0);

    Animated.timing(slideAnim2,{
      delay: 200,
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
      easing: Easing.bezier(0, 1.02, 0.21, 0.97)
    }).start();

    Animated.timing(opacityAnim,{
      delay: 200,
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    Animated.timing(opacityAnim2,{
      delay: 200,
      toValue: 0.1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }

  const slide = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 700,
      useNativeDriver: true,
      easing: Easing.bezier(0, 1.02, 0.21, 0.97),
    }).start();
  };

  const hide = ( withOnExit ) => {
    if (withOnExit) {
      Animated.timing(slideAnim, {
        toValue: screen_width,
        duration: 300,
        useNativeDriver: true
      }).start(({ finished }) => {
        if (finished) {
          setLoading(true);
          onExit();
          setModalVisible(false);
          scrollRef.current?.scrollTo({
            x: 0,
            y: 0,
            animated: false,
          });
          slideAnim2.setValue(-20);
          opacityAnim.setValue(0);
          opacityAnim2.setValue(0);
        }
      });
    }
    else {
      Animated.timing(slideAnim, {
        toValue: screen_width,
        duration: 300,
        useNativeDriver: true
      }).start(({ finished }) => {
        if (finished) {
          setLoading(true);
          setModalVisible(false);
          scrollRef.current?.scrollTo({
            x: 0,
            y: 0,
            animated: false,
          });
        }
      });
    }
  };

  show ? slide() : hide();

  const chopUrl = (url) => {
    var result;
    result = url.replace("s96-c", "s300-c");
    return result;
  };

  const chopTimeStamp = (timestamp) => {
    var a = new Date(timestamp);

    return a.toTimeString().substring(0, 5) + " Uhr";
  };

  const removeFriend = async (id) => {
    setLoading(true);
    try {
      const docRef = doc(firestore, "users", realuser.id);
      const docSnap = await getDoc(docRef);

      var buffer;
      if (docSnap.exists()) {
        buffer = docSnap.data().friends;
      }

      updateDoc(docRef, {
        friends: buffer.filter((item) => item != id),
      });

      refreshUser({
        friends: buffer.filter((item) => item != id)
      });
    } catch (e) {
      console.log("Error", e);
    }

    try {
      const docRef = doc(firestore, "users", id);
      const docSnap = await getDoc(docRef);

      var buffer;
      if (docSnap.exists()) {
        buffer = docSnap.data().friends;
      }

      updateDoc(docRef, {
        friends: buffer.filter((item) => item != realuser.id),
      });
    } catch (e) {
      console.log("Error", e);
    }
    setModalVisible(false);
    onRemoveFriend();
  };

  const toggleMapType = () => {
    mapType == "standard" ? setMapType("hybrid") : setMapType("standard");
  }

 const mapModalContent = !loading ?  <>
 <View style={{height: "100%", width: "100%", position: "absolute", top: 0, zIndex: 1000000}}>

 <View style={{bottom: 50, position: "absolute", width: "100%", flexDirection: "column", zIndex: 1}}>
    <View style={{zIndex: 1, alignSelf: "center"}}>
    <IconButton icon={switch_icon} onPress={toggleMapType}/>
    </View>
    <View style={{height: responsiveHeight(1)}}></View>
    <Button title={language.account_delete_account_cancel} color={"#eb4034"} borderradius={100} onPress={() => setShowMap(false)} fontColor={"white"}/>
 </View>

 <MapView
   provider={PROVIDER_GOOGLE}
   initialRegion={{
       longitude: user.last_entry_longitude,
       latitude: user.last_entry_latitude,
       longitudeDelta: 0.02,
       latitudeDelta: 0.02
   }}
   style={styles.map}
   customMapStyle={mapStyle}
   showsUserLocation={true}
   followsUserLocation={true}
   showsCompass={false}
   showsTraffic={false}
   showsIndoors={true}
   mapType={mapType}
   pitchEnabled={true}
   showsMyLocationButton={false}
   >
     <><Marker
         tracksViewChanges={false}
         key={uuidv4()}
         coordinate={{
             latitude: user.last_entry_latitude,
             longitude: user.last_entry_longitude,
         }}
         >
           <CustomMarker
               photoUrl={user.photoUrl}
               username={user.username}
               type={user.last_entry_type}
               timestamp={user.last_entry_timestamp}
               withOutDate={true}
           />
         </Marker>
       </>
   </MapView> 
 </View>
 </> : null;

 const deleteFriendModalContent = !loading ? <View
 style={{
   flex: 1,
   alignItems: "center",
   justifyContent: "center",
   backgroundColor: "rgba(0,0,0,0.5)",
 }}
>
 <View style={styles.modal_container}>
   <>
     <View style={{ flex: 1, justifyContent: "center" }}>
       {config.language == "de" ? <Text style={styles.heading}>
         <Text style={{color: "#0080FF"}}>{user.username}</Text> {language.remove_friend}
       </Text> : <Text style={styles.heading}>
       {language.remove_friend} <Text style={{color: "#0080FF"}}>{user.username}</Text> ?         
       </Text>}
     </View>
     <View style={{ flex: 1, flexDirection: "row" }}>
       <View
         style={{
           flex: 1,
           justifyContent: "center",
           alignItems: "center",
         }}
       >
         <Button title={language.account_delete_account_cancel} onPress={() => setModalVisible(false)} color={"#484F78"} fontColor={"white"} hovercolor={"rgba(255,255,255,0.25)"}/>
       </View>
       <View
         style={{
           flex: 1,
           justifyContent: "center",
           alignItems: "center",
         }}
       >
         <Button title={language.friendpage_remove} onPress={() => removeFriend(user.id)} color={"#eb4034"} fontColor={"white"} hovercolor={"rgba(255,255,255,0.25)"}/>
       </View>
     </View>
   </>
 </View>
</View> : null;

  return (
    <>
      {user ? (
        
        <Animated.View
          style={[styles.container, { transform: [{ translateX: slideAnim }]}]}
        >

      <Modal animationType="fade" visible={showProfilePicture}>
        <ProfileImagePanel url={user.photoUrl} onExit={() => setShowProfilePicture(false)}/>
      </Modal>


        {/** friend map modal */}
        <CustomModal show={showMap} child={mapModalContent}/>

        {/** delete friend modal */}
        <CustomModal show={modalVisible} child={deleteFriendModalContent}/>

        { //here begins visible component
        }

        <View style={{flex: 1}}>

          <View style={{height: Dimensions.get("window").width, position: "absolute", width: Dimensions.get("window").width}}>
            <Image source={{uri: chopUrl(user.photoUrl)}} style={styles.profile_image}/>
          </View>

          <ScrollView ref={scrollRef}>

            <View style={{height: Dimensions.get("window").width}}>
              <LinearGradient colors={["rgba(0,0,0,0)","#1E2132"]} style={{width: "100%", height: "60%", bottom: 0, zIndex: 1, position: "absolute"}}/>
            </View>

          <View style={{flex: 1, backgroundColor: "#1E2132"}}>
            
          <View
            style={{
              zIndex: 6,
              marginTop: 10,
              position: "relative",
              width: "100%",
              justifyContent: "center"
            }}
          >
            <View style={{position: "absolute", zIndex: 20, left: 15}}>
              <BackButton onPress={() => {onExit(); hide();}} />
            </View>

            <View style={{alignSelf: "center"}}>

              <View style={{justifyContent: "center", alignItems: "center"}}>
                <Animated.Text style={[styles.username,{opacity: 1}]}>{!loading ? user.username : " "}</Animated.Text>
              </View>
            </View>
          </View> 

          <View style={{height: responsiveHeight(2.5)}}></View>

          {/* COUNTER */}
          <View style={{width: "80%", alignSelf: "center"}}>
            <Text style={styles.label}>Counter</Text>
            <View style={{ height: responsiveHeight(1) }}></View>
              <View style={[styles.activity_container, {flexDirection: "column", padding: responsiveFontSize(2)}]}>

              {/* GESAMT */}
              {!loading ?<>

                <View>
                  <View>
                    {friendConfig.shareMainCounter ? <Text style={[styles.small_counter,{fontSize: responsiveFontSize(4)}]}>{user.main_counter}</Text> : <MaterialIcons name="lock" style={styles.lock_icon}/>}
                  </View>
                  <View>
                    <Text style={[styles.small_label]}>{language.stats_all.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={{height: responsiveHeight(2.5)}}></View>

                {/* DETAIL */}
                <View style={{flexDirection: "row"}}>
                  
                    <View style={{flex: 1, justifyContent: "center"}}>
                        <Animated.View style={{opacity: 1, transform: [{translateX: 0}]}}>
                          {friendConfig.shareTypeCounters ? <Text style={styles.small_counter}>{user.joint_counter}</Text> : <MaterialIcons name="lock" style={styles.lock_icon}/>}
                        </Animated.View>
                        <Text style={styles.small_label}>JOINT</Text>
                        <Animated.Image style={[styles.small_image,{height: responsiveHeight(3), width: responsiveHeight(5), marginTop: responsiveHeight(-1), opacity: 0.2}]} source={require('../../../../../../data/img/joint.png')}/>
                    </View>

                    <View style={{flex: 1, justifyContent: "center"}}>
                     <Animated.View style={{opacity: 1, transform: [{translateX: 0}]}}>
                     {friendConfig.shareTypeCounters ? <Text style={styles.small_counter}>{user.bong_counter}</Text> : <MaterialIcons name="lock" style={styles.lock_icon}/>}
                      </Animated.View>
                        <Text style={styles.small_label}>BONG</Text>
                        <Animated.Image style={[styles.small_image,{height: responsiveHeight(6), width: responsiveHeight(3), marginTop: responsiveHeight(-1), opacity: 0.2}]} source={require('../../../../../../data/img/bong.png')}/>
                    </View>

                    <View style={{flex: 1, justifyContent: "center"}}>
                      <Animated.View style={{opacity: 1, transform: [{translateX: 0}]}}>
                      {friendConfig.shareTypeCounters ? <Text style={styles.small_counter}>{user.vape_counter}</Text> : <MaterialIcons name="lock" style={styles.lock_icon}/>}
                      </Animated.View>
                        <Text style={styles.small_label}>VAPE</Text>
                        <Animated.Image style={[styles.small_image,{height: responsiveHeight(7), width: responsiveWidth(7), marginTop: responsiveHeight(-1), opacity: 0.2}]} source={require('../../../../../../data/img/vape.png')}/>
                    </View>

                    <View style={{flex: 1, justifyContent: "center"}}>
                     <Animated.View style={{opacity: 1, transform: [{translateX: 0}]}}>
                      {friendConfig.shareTypeCounters ? <Text style={styles.small_counter}>{user.pipe_counter}</Text> : <MaterialIcons name="lock" style={styles.lock_icon}/>}
                      </Animated.View>
                        <Text style={styles.small_label}>PFEIFE</Text>
                        <Animated.Image style={[styles.small_image,{height: responsiveHeight(3), width: responsiveWidth(10), marginTop: responsiveHeight(0), opacity: 0.2}]} source={require('../../../../../../data/img/pipe.png')}/>
                    </View>

                    <View style={{flex: 1, justifyContent: "center"}}>
                      <Animated.View style={{opacity: 1, transform: [{translateX: 0}]}}>
                      {friendConfig.shareTypeCounters ? <Text style={styles.small_counter}>{user.cookie_counter}</Text> : <MaterialIcons name="lock" style={styles.lock_icon}/>}
                      </Animated.View>
                        <Text style={styles.small_label}>EDIBLE</Text>
                        <Animated.Image style={[styles.small_image,{height: responsiveHeight(4), width: responsiveWidth(8), marginTop: responsiveHeight(1), opacity: 0.2}]} source={require('../../../../../../data/img/cookie.png')}/>
                    </View>

                </View>
                </> : <CustomLoader x={responsiveFontSize(4)} color={"#0080FF"}/>}
              </View>
          </View>
              
              <View style={{height: responsiveHeight(2.5)}}></View>

              {/**LAST ACTIVITY */}
               

              <View style={{position: "relative", width: "100%", alignSelf: "center", flex: 4}}>
                <View style={{width: "80%", alignSelf: "center"}}>
                
                <Text style={styles.label}>{language.friendpage_last_activity}</Text>
                {user.last_entry_latitude != null ?<>
                <View style={{ height: responsiveHeight(1)}}></View>
                <View style={[styles.activity_container,{flexDirection: "column", overflow: "hidden"}]}>
                
                {!loading ? <>
                <View style={{borderBottomLeftRadius: 15, borderBottomRightRadius: 15, overflow: "hidden"}}>

                  <View style={{width: "100%", height: "40%", position: "absolute", zIndex: 2, top: 0, flexDirection: "row", padding: responsiveFontSize(2)}}>
                    {friendConfig.shareLastEntry ? <>
                    <View style={{flex: 2, alignItems: "center"}}>
                      <TypeImage type={user.last_entry_type} x={40}/>
                    </View>
                    <View style={{flex: 8, flexDirection: "column"}}>
                      <View style={{flex: 1}}>
                        <Text style={styles.date}>{toGermanDate(new Date(user.last_entry_timestamp))}</Text>
                      </View>
                      <View style={{flex: 1}}>
                        <Text style={styles.date}>{chopTimeStamp(user.last_entry_timestamp)}</Text>
                      </View>
                    </View></> : <MaterialIcons name="lock" style={styles.lock_icon}/> }
                  </View>

                  <LinearGradient style={{width: "100%", height: friendConfig.shareGPS ? "70%" : "100%", position: "absolute", zIndex: 1, top: 0, justifyContent: "center"}} colors={["rgba(0,0,0,0.9)","rgba(0,0,0,0)"]}>
                    {!friendConfig.shareGPS ? <MaterialIcons name="lock" style={styles.lock_icon}/> : null}
                  </LinearGradient>

                  <MapView 
                    style={{height: 200, width: "100%", zIndex: -1}}
                    customMapStyle={mapStyle}
                    scrollEnabled={false}
                    region={friendConfig.shareGPS ? {
                      latitude: user.last_entry_latitude + responsiveFontSize(0.005),
                      longitude: user.last_entry_longitude,
                      longitudeDelta: 0.1,
                      latitudeDelta: 0.1
                    } : {
                      latitude: 50.228293,
                      longitude:  10.812738,
                      longitudeDelta: 1000,
                      latitudeDelta: 1000
                    }}
                    loadingBackgroundColor={"#1E2132"}
                  >  
                  <Marker
                    tracksViewChanges={false}
                    key={uuidv4()}
                    coordinate={{
                      latitude: user.last_entry_latitude,
                      longitude: user.last_entry_longitude,
                    }}
                  >
                      <CustomMarker
                        photoUrl={user.photoUrl}
                        type={user.last_entry_type}
                        withOutDate={true}
                      />
                  </Marker>
                  </MapView>
                </View>
                </> : <CustomLoader x={responsiveFontSize(4)} color={"#0080FF"}/>}
                </View>
                </>: <Empty title={"Nutzer hat keine letzten Einträge"}/>}
                </View>
                <View style={{height: responsiveHeight(2.5)}}></View>
                {loading ? null : <> 
                {friendConfig.shareGPS && user.last_entry_latitude != null ? <Button title={language.show_on_map} color={"#484F78"} fontColor={"white"} hovercolor={"rgba(255,255,255,0.25)"} onPress={() => setShowMap(true)}/> : null}</>}
              </View>


              <View style={{height: responsiveHeight(2.5)}}></View>


              {/**MEMBER SINCE */}

              <View style={{width: "80%", alignSelf: "center"}}>

                <Text style={styles.label}>{language.account_member_since}</Text>
                <View style={{ height: 10 }}></View>

                <MemberSince timestamp={user.member_since} backgroundColor={"#131520"}/>
                
              </View>

              {/**FREUND ENTFERNEN */}

              <View style={{height: responsiveHeight(2.5)}}></View>

              <View style={{position: "relative", width: "100%", flex: 1, marginBottom: 20}}>
                <TouchableNativeFeedback
                  background={TouchableNativeFeedback.Ripple(
                    "rgba(255,255,255,0.05)",
                    false
                  )}
                  onPress={() => setModalVisible(true)}
                >
                  <View style={styles.touchable_delete}>
                    <Text style={styles.delete_text}>{language.friendpage_remove_friend}</Text>
                  </View>
                </TouchableNativeFeedback>
              </View>

              <View style={{height: 100}}></View>
          </View>
          </ScrollView> 
        </View>
        </Animated.View>
        
      ) : null}
    </>
  );
};

export default FriendPage;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    position: "absolute",
    zIndex: 10000,
    backgroundColor: "#1E2132",
    borderRadius: 25,
    overflow: "hidden"
  },
  username: {
    color: "white",
    fontSize: responsiveFontSize(3),
    fontFamily: "PoppinsBlack"
  },
  label: {
    color: "white",
    fontSize: responsiveFontSize(1.5),
    fontFamily: "PoppinsMedium",
    textAlignVertical: "center",
    textAlign: "left"
  },
  date: {
    color: "white",
    fontSize: responsiveFontSize(1.75),
    fontFamily: "PoppinsLight",
    textAlignVertical: "center",
    textAlign: "left",
  },
  touchable_delete: {
    width: "100%",
    alignSelf: "center",
    height: 60,
    borderRadius: 100,
  },
  delete_text: {
    color: "#eb4034",
    fontFamily: "PoppinsLight",
    alignSelf: "center",
    textAlignVertical: "center",
    height: "100%",
  },
  modal_container: {
    backgroundColor: "#1E2132",
    width: "90%",
    height: 300,
    alignSelf: "center",
    borderRadius: 25,
    flexDirection: "column",
  },
  heading: {
    color: "white",
    textAlign: "center",
    fontFamily: "PoppinsBlack",
    fontSize: 22,
    maxWidth: 300,
    alignSelf: "center",
  },
  activity_container: {
    backgroundColor: "#131520",
    borderRadius: 15,
    flexDirection: "row",
    width: "100%",
    alignSelf: "center",
    justifyContent: "center"
  },
  small_counter: {
    zIndex: 2,
    color: "white",
    fontSize: responsiveFontSize(3),
    fontFamily: "PoppinsMedium",
    textAlign: "center",
    opacity: 1
  },
  small_image: {
      height: responsiveHeight(8),
      width: responsiveHeight(2),
      position: "absolute",
      zIndex: -1,
      opacity: 0.2,
      alignSelf: "center",
      marginTop: responsiveHeight(-1)
  },
  small_label: {
    textAlign: "center",
    zIndex: 1,
    color: "rgba(255,255,255,1)",
    fontFamily: "PoppinsLight",
    fontSize: responsiveFontSize(1.4)
  },
  profile_image: {
    height: Dimensions.get("window").width,
    width: "100%"
  },
  lock_icon: {
    color: "white",
    fontSize: responsiveFontSize(2.5),
    textAlign: "center",
    marginBottom: 10
  },
  map: {
    width: "100%",
    height: "100%",
    position: "absolute",
    backgroundColor: "#171717",
  },
});
