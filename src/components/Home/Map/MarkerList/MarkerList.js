//React
import React, {useContext, useEffect, useRef, useState} from "react";
import { Animated, View, StyleSheet, Dimensions, Easing, Text, ScrollView, RefreshControl } from "react-native";
import { useBackHandler } from '@react-native-community/hooks'

//Custom Components
import BackButton from "../../../common/BackButton";
import Empty from "../../../common/Empty";

//Service
import { UserContext } from "../../../../data/UserContext";
import { LanguageContext } from "../../../../data/LanguageContext";
import { FriendListContext } from "../../../../data/FriendListContext";
import MarkerListItem from "./MarkerListItem/MarkerListItem";
import { uuidv4 } from "@firebase/util";

const MarkerList = ({onExit, setRegion, markers, onRefresh}) => {

    //Context
    const user = useContext(UserContext)
    const language = useContext(LanguageContext);
    const friendList = useContext(FriendListContext)

    //State
    const [refreshing, setRefreshing] = useState(false);
    
    //Constants
    const screen_height = Dimensions.get("screen").height;

    //Refs
    const slideAnim = useRef(new Animated.Value(screen_height)).current;
    const textInputRef = useRef(null);

    useEffect(() => {
        Animated.timing(slideAnim,{
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
            easing: Easing.bezier(0,1.02,.21,.97)
        }).start();
    });
    
    const hide = () => {
        Animated.timing(slideAnim,{
            toValue: screen_height,
            duration: 300,
            useNativeDriver: true,
        }).start(({finished}) => {
            onExit();
        });
    }

    useBackHandler(() => {
        hide();
        return true
    })

    const handlePress = (marker) => {
        setRegion({
            center: {
               latitude: marker.latitude,
               longitude: marker.longitude,
           },
           pitch: 0,
           zoom: 15
        }, 1000);
        hide();
    }

    return (
        <Animated.View style={[styles.container,{transform: [{translateY: slideAnim}]}]}>
            <View style={{height: 20}}></View>
     
            <View
            style={{ width: "100%", flexDirection: "row"}}
            >
                <View style={{ flex: 1, alignItems: "center" }}>
                    <BackButton onPress={() => hide()} />
                </View>
                <View style={{ flex: 5, justifyContent: "center"}}>
                    <Text style={[styles.heading,{textAlign: "left"}]}>{language.friends_friends} - {language.friendpage_last_activity}</Text>
                </View>
            </View>
            
            <ScrollView style={{width: "100%", flex: 1, alignSelf: "center", marginTop: 20}} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["white"]} progressBackgroundColor={"#484F78"}/>}>
            {
                markers.length != 0 ? markers.sort((a,b) => a.timestamp < b.timestamp).map((marker) => {
                    return <MarkerListItem key={uuidv4()} marker={marker} onPress={() => handlePress(marker)}/>
                }) : <Empty title={language.map_no_friends} tip={language.map_no_friends_tip}/>
            }
            </ScrollView>
        </Animated.View>
    );
}

export default MarkerList

const styles = StyleSheet.create({
    container: {
        height: "90%",
        width: "100%",
        backgroundColor: "#1E2132",
        zIndex: 10,
        position: "absolute",
        bottom: 0,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25
    },
    input: {
        backgroundColor: "#1E2132",
        width: "90%",
        alignSelf: "center",
        height: 60,
        borderRadius: 10,
        paddingLeft: 20,
        color: "white",
        fontSize: 18,
        fontFamily: "PoppinsMedium",
    },
    modal_container: {
        backgroundColor: "#1E2132",
        width: "90%",
        height: 300,
        alignSelf: "center",
        borderRadius: 25,
        flexDirection: "column"
    },
    heading: {
        color: "white",
        fontFamily: "PoppinsMedium",
        fontSize: 20,
        textAlign: "center"
    }
});