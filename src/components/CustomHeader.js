import React, { useContext, useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    ActivityIndicator,
    ImageBackground,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image,
    Switch,
    Alert,
    Platform,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { hambargar, userPhoto } from '../utils/Images';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from '@env'
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Logo from '../../src/assets/images/misc/logo.svg';
import messaging from '@react-native-firebase/messaging';
import Sound from 'react-native-sound';
import ChatRequestModal from './ChatRequestModal';
import notifee, { EventType } from '@notifee/react-native';
import { withTranslation, useTranslation } from 'react-i18next';

const CustomHeader = ({ onPress,
    commingFrom,
    title,
    onPressProfile, }) => {

    // const { userInfo } = useContext(AuthContext)
    // console.log(userInfo?.photo)
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const [userInfo, setuserInfo] = useState([])
    const [isEnabled, setIsEnabled] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [sessionDetails, setSessionDetails] = useState(null);
    //let sound;
    const soundRef = useRef(null);

    const toggleSwitch = async () => {
        const newStatus = !isEnabled;

        // Optimistically update the switch UI
        setIsEnabled(newStatus);

        const status = newStatus ? '1' : '0';

        try {
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                console.log('No user token found');
                return;
            }
            const option = { "online_offline": status };
            console.log(userToken, 'usertoken');
            console.log(option);
            const response = await axios.post(`${API_URL}/astrologer/astrologers-offline-online`, option, {
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": 'application/json'
                }
            });

            console.log(response.data, 'bbbbb')

            if (response.data.response !== true) {
                // If the response is not successful, revert the switch state
                setIsEnabled(prevState => !prevState);
            }
        } catch (error) {
            console.log(`status change error: ${error}`);
            // Revert the switch state in case of an error
            setIsEnabled(prevState => !prevState);
        }
    };

    const fetchProfileDetails = async () => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                console.log('No user token found');
                return;
            }
            console.log(userToken, 'usertoken');
            const response = await axios.post(`${API_URL}/astrologer/profile`, {}, {
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": 'application/json'
                }
            });
            const userInfo = response.data.data;
            console.log(userInfo, 'user data from header');
            // setuserInfo(userInfo);
            if (userInfo.active_status == 1) {
                setIsEnabled(true)
            } else {
                setIsEnabled(false)
            }

        } catch (error) {
            console.log(`Profile error ${error}`);
        }
    };
    useEffect(() => {
        fetchProfileDetails()
    }, [])
    useFocusEffect(
        React.useCallback(() => {
            fetchProfileDetails()
        }, [])
    )

    const handleJoin = async () => {
        if (sessionDetails) {
            console.log(sessionDetails, 'sessionDetailssessionDetailssessionDetails');
            await stopSound();
            await acceptInvitation(sessionDetails.id, sessionDetails);
            setModalVisible(false);
        }
    };

    const handleReject = async () => {
        if (sessionDetails) {
            await stopSound();
            await cancelInvitation(sessionDetails.id);
            setModalVisible(false);
        }
    };
    const playSound = async () => {
        if (!soundRef.current) {
            soundRef.current = new Sound('notification.wav', Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    console.log('Failed to load sound', error);
                    return;
                }
                soundRef.current.play((success) => {
                    if (!success) {
                        console.log('Sound playback failed');
                    }
                });
            });
        }
    };

    const stopSound = async () => {
        if (soundRef.current) {
            soundRef.current.stop(() => {
                console.log('Sound stopped');
                soundRef.current.release(); // Releases the sound instance
                soundRef.current = null; // Reset ref to null
            });
        }
    };
    useEffect(() => {
        if (Platform.OS == 'android') {
            const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
                const parsevalue = JSON.parse(remoteMessage?.data?.data)

                if (remoteMessage?.data?.screen === 'Session') {
                    playSound();
                    setModalVisible(true)
                    setSessionDetails(parsevalue);

                }
                console.log('Received foreground message:', remoteMessage);

            });

            const unsubscribeBackground = messaging().setBackgroundMessageHandler(async remoteMessage => {
                console.log('Received background message from custom header:', remoteMessage);
                if (remoteMessage?.data?.screen === 'Session') {
                    await onDisplayNotification(remoteMessage)
                }
            });

            return () => {
                unsubscribeForeground();
                //unsubscribeBackground();
            };
        }
    }, [])
    async function onDisplayNotification(remoteMessage) {
        // Request permissions (required for iOS)
        await notifee.requestPermission();

        // Create a channel (required for Android)
        const channelId = await notifee.createChannel({
            id: 'default',
            name: 'Default Channel',
        });

        // Extract details from the message
        const { title, body } = remoteMessage.notification || {}; // Use remoteMessage.notification if available
        const data = JSON.parse(remoteMessage.data?.data || '{}'); // Custom data parsing
        const sanitizedData = Object.keys(data).reduce((acc, key) => {
            acc[key] = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
            return acc;
        }, {});
        // Display a notification
        await notifee.displayNotification({
            title: title || 'Notification Title',
            body: body || 'Main body content of the notification',
            android: {
                channelId,
                // smallIcon: 'name-of-a-small-icon', // optional, defaults to 'ic_launcher'.
                pressAction: {
                    id: 'default', // Opens the app when notification is pressed
                },
                actions: [
                    {
                        title: 'Accept', // Text for the first button
                        pressAction: {
                            id: 'accept', // Unique ID for this action
                            launchActivity: 'default',
                        },
                    },
                    {
                        title: 'Decline', // Text for the second button
                        pressAction: {
                            id: 'decline', // Unique ID for this action
                            launchActivity: 'default',
                        },
                    },
                ],
            },
            data: sanitizedData,
        });
    }

    //   useEffect(() => {
    //     // Register the foreground event listener
    //     const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
    //       if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'accept') {
    //         console.log('Accept button pressed');
    //         // Handle accept action
    //       } else if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'decline') {
    //         console.log('Decline button pressed');
    //         // Handle decline action
    //       }
    //     });

    //     // Cleanup listener on component unmount
    //     return () => {
    //       unsubscribe();
    //     };
    //   }, []);
    const cancelInvitation = async (sessionid) => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                console.log('No user token found');
                return;
            }
            const option = { "session_id": sessionid };
            console.log(userToken, 'usertoken');
            console.log(option);
            const response = await axios.post(`${API_URL}/astrologer/astrologer-cancel-session`, option, {
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": 'application/json'
                }
            });

            console.log(response.data, 'bbbbb')

            if (response.data.response == true) {

            }
        } catch (error) {
            console.log(`cancel session error: ${error}`);
        }
    }
    const acceptInvitation = async (sessionid, data) => {
        try {
            const userToken = await AsyncStorage.getItem('userToken');
            if (!userToken) {
                console.log('No user token found');
                return;
            }
            const option = { "session_id": sessionid };
            console.log(userToken, 'usertoken');
            console.log(option);
            const response = await axios.post(`${API_URL}/astrologer/astrologer-accept-session`, option, {
                headers: {
                    "Authorization": `Bearer ${userToken}`,
                    "Content-Type": 'application/json'
                }
            });

            console.log(response.data, 'bbbbb')

            if (response.data.response == true) {
                const parsedData = data;
                const chat = parsedData.chat;
                navigation.navigate("ChatScreen", { commingFrom: chat == '1' ? "from_chat" : "from_call", details2: parsedData, details: response.data.data })
            }
        } catch (error) {
            console.log(`accept session error: ${error}`);
        }
    }
    return (
        <>
            {commingFrom == 'Home' ?
                <>
                    <LinearGradient
                        colors={['#EFDFC9', '#FFFFFF']} // Example colors, replace with your desired gradient
                        locations={[0, 1]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={styles.headerView}
                    >
                        <View style={styles.firstSection}>
                            <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={{ width: 44, height: 44, borderRadius: 44 / 2, justifyContent: 'center', alignItems: 'center' }}>
                                {/* {userInfo?.photo ?
                                    <Image
                                        source={{ uri: userInfo?.photo }}
                                        style={styles.headerImage}
                                    /> : */}
                                <Image
                                    source={hambargar}
                                    style={styles.headerImage}
                                />
                                {/* } */}
                            </TouchableOpacity>
                            {/* <Image
                                source={require('../assets/images/icon.png')}
                                style={{ height: responsiveHeight(3.5), width: responsiveWidth(25), resizeMode: 'contain', marginLeft: responsiveWidth(2) }}
                            /> */}
                            <Logo
                                width={responsiveWidth(25)}
                                height={responsiveHeight(5)}
                            //style={{transform: [{rotate: '-15deg'}]}}
                            />
                        </View>
                        <View style={{ height: responsiveHeight(6), width: responsiveWidth(40), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 2, }}>
                            <Text style={{ color: '#3A3232', fontSize: responsiveFontSize(1.5), fontFamily: 'PlusJakartaSans-SemiBold', marginRight: responsiveWidth(3) }}>{t('CustomHeader.CurrentAvailability')}</Text>
                            <Switch
                                trackColor={{ false: '#767577', true: '#1CAB04' }}
                                thumbColor={isEnabled ? '#fff' : '#fff'}
                                ios_backgroundColor="#3e3e3e"
                                onValueChange={toggleSwitch}
                                value={isEnabled}
                                style={styles.switchStyle}
                            />
                        </View>
                    </LinearGradient>
                    <View style={styles.headerBottomMargin} />
                </>
                : commingFrom == 'chat' ?
                    <>
                        <View style={styles.chatPageheaderView}>
                            <TouchableOpacity onPress={onPress}>
                                <Ionicons name="chevron-back" size={25} color="#FFF" />
                            </TouchableOpacity>
                            <Image
                                source={userPhoto}
                                style={styles.imageStyle}
                            />
                            <Text style={styles.chatPageheaderTitle}>{title}</Text>
                        </View>
                        <View style={styles.headerBottomMargin} />
                    </>
                    :
                    <>
                        <LinearGradient
                            colors={['#EFDFC9', '#FFFFFF']} // Example colors, replace with your desired gradient
                            locations={[0, 1]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 0, y: 1 }}
                        >
                            <View style={styles.innerPageheaderView}>
                                <TouchableOpacity onPress={onPress}>
                                    <Ionicons name="chevron-back" size={25} color="#000" />
                                </TouchableOpacity>
                                <Text style={styles.innerPageheaderTitle}>{title}</Text>
                            </View>
                        </LinearGradient>
                        <View style={styles.headerBottomMargin} />
                    </>
            }
            <ChatRequestModal
                visible={modalVisible}
                onJoin={handleJoin}
                onReject={handleReject}
                onClose={() => setModalVisible(false)}
                name={sessionDetails?.user?.full_name}
                consultationType=""
                image={sessionDetails?.user?.profile_pic}
            />
        </>
    )
}

const styles = StyleSheet.create({
    headerView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginTop: -responsiveHeight(1),
        paddingRight: responsiveWidth(7)
    },
    innerPageheaderView: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 20
    },
    chatPageheaderView: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#4B47FF'
    },
    innerPageheaderTitle: {
        color: '#2F2F2F',
        fontSize: responsiveFontSize(2.2),
        fontFamily: 'PlusJakartaSans-SemiBold',
        marginLeft: 10
    },
    chatPageheaderTitle: {
        color: '#FFF',
        fontSize: responsiveFontSize(2.2),
        fontFamily: 'PlusJakartaSans-SemiBold',
        marginLeft: 10
    },
    firstSection: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerImage: {
        width: 15,
        height: 15,
    },
    firstText: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'PlusJakartaSans-SemiBold',
        marginLeft: 10,
        color: '#FFFFFF'
    },
    secondText: {
        fontSize: responsiveFontSize(1.5),
        fontFamily: 'PlusJakartaSans-SemiBold',
        marginLeft: 10,
        color: '#F4F4F4'
    },
    notificationdotView: {
        position: 'absolute',
        top: -2,
        right: 3
    },
    notificationdot: {
        color: '#EB0000',
        fontSize: 12
    },
    headerBottomMargin: {
        borderBottomColor: '#FFFFFF',
        borderBottomWidth: StyleSheet.hairlineWidth,
        elevation: 0
    },
    imageStyle: {
        height: 40,
        width: 40,
        borderRadius: 40 / 2,
        marginLeft: 5
    },
    switchStyle: {
        ...Platform.select({
            ios: {
                transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]  // Adjust scale values as needed
            },
            android: {
                transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }]  // Adjust scale values as needed
            }
        })
    }
})

export default withTranslation()(CustomHeader)