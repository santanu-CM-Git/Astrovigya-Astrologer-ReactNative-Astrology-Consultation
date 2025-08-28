import React, { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, ImageBackground, Image, PermissionsAndroid, Alert, BackHandler, Platform } from 'react-native'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { GreenTick, audiooffIcon, audioonIcon, callIcon, chatImg, filesendImg, sendImg, speakeroffIcon, speakeronIcon, summaryIcon, userPhoto, videoIcon, audioBgImg, defaultUserImg, switchcameraIcon, callIconImg, chatIconImg, chatInfoImg } from '../../utils/Images'
import { GiftedChat, InputToolbar, Bubble, Send, Composer } from 'react-native-gifted-chat'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import InChatFileTransfer from '../../components/InChatFileTransfer';
import { API_URL, AGORA_APP_ID } from '@env'
import { TabActions, useNavigation, useRoute } from '@react-navigation/native';
import KeepAwake from 'react-native-keep-awake';
import firestore, { endBefore } from '@react-native-firebase/firestore'
import Ionicons from 'react-native-vector-icons/Ionicons';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Entypo';
import Modal from "react-native-modal";
import { withTranslation, useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  ClientRoleType,
  createAgoraRtcEngine,
  ChannelProfileType,
  RtcSurfaceView,
  IRtcEngine
} from 'react-native-agora';
import moment from 'moment-timezone'
import Loader from '../../utils/Loader'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import BackgroundTimer from 'react-native-background-timer';



const ChatScreen = ({  route }) => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const routepage = useRoute();

  // For audio call
  const appId = AGORA_APP_ID;
  const token = route?.params?.details?.agora_token;
  const channelName = route?.params?.details?.agora_channel_id;
  const uid = 0; // Local user UID, no need to modify
  //const token = '007eJxTYNgqtZPz9N8ZM9zsuD9O9Z6W395xLcJlQsQkhxuyHkGcOj0KDCmmZimphknJiRZJ5iZGhqaWJoapKcZGRqkWSSkW5gYmaxdJpDcEMjIUyvQwMjJAIIjPyZCYnl+UWJJaXMLAAACZlh/d';
  //const channelName = 'agoratest';

  const [messages, setMessages] = useState([])
  const [therapistId, setTherapistId] = useState(route?.params?.details?.astrologer_id)
  const [therapistProfilePic, setTherapistProfilePic] = useState(route?.params?.details?.therapist?.profile_pic)
  const [patientId, setPatientId] = useState(route?.params?.details?.user_id)
  const [patientProfilePic, setPatientProfilePic] = useState(route?.params?.details?.patient?.profile_pic)
  const [chatgenidres, setChatgenidres] = useState(route?.params?.details?.uuid);
  const [isAttachImage, setIsAttachImage] = useState(false);
  const [isAttachFile, setIsAttachFile] = useState(false);
  const [imagePath, setImagePath] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileVisible, setFileVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState(route?.params?.commingFrom == 'from_chat' ? 'chat' : 'audio')
  const [isLoading, setIsLoading] = useState(false)
  const [timer, setTimer] = useState(route?.params?.details2?.available_min * 60);
  //const [endTime, setEndTime] = useState(moment().add(route?.params?.details2?.available_min, 'minutes').format('HH:mm:ss'));
  const [endTime, setEndTime] = useState(moment().add(route?.params?.details2?.available_min, 'minutes').toDate());
  const intervalRef = useRef(null);
  const [birthDetailsText, setBirthDetailsText] = useState([])

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  useEffect(() => {

    if (route?.params?.commingFrom === 'from_chat') {
      goingToactiveTab('chat')
    } else {
      goingToactiveTab('audio')
    }
  }, [])

  useEffect(() => {
    // console.log(routepage.name);
    if (routepage.name === 'ChatScreen') {
      const backAction = () => {
        // Prevent the default back button action
        return true;
      };

      // Add event listener to handle the back button
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      // Clean up the event listener when the component unmounts
      return () => backHandler.remove();
    }
  }, [routepage]);


  // useEffect(() => {
  //   if (endTime) {
  //     intervalRef.current = BackgroundTimer.setInterval(() => {
  //       const currentTime = new Date();
  //       const endDate = moment(endTime, 'HH:mm:ss').toDate();
  //       const timeDifferenceInSeconds = Math.max(0, Math.floor((endDate - currentTime) / 1000));
  //       if (timeDifferenceInSeconds <= 0) {
  //         BackgroundTimer.clearInterval(intervalRef.current);
  //         handleTimerEnd();
  //       }
  //       setTimer(timeDifferenceInSeconds);
  //     }, 1000);

  //     return () => BackgroundTimer.clearInterval(intervalRef.current);
  //   }
  // }, [endTime]);
  useEffect(() => {
    if (endTime) {
      intervalRef.current = BackgroundTimer.setInterval(() => {
        const currentTime = new Date();
        const timeDifferenceInSeconds = Math.max(0, Math.floor((endTime - currentTime) / 1000));
        console.log('Timer tick - Current:', currentTime.toISOString(), 'End:', endTime.toISOString(), 'Remaining:', timeDifferenceInSeconds, 'seconds');
        if (timeDifferenceInSeconds <= 0) {
          console.log('Timer ended - calling handleTimerEnd');
          BackgroundTimer.clearInterval(intervalRef.current);
          handleTimerEnd();
        }
        setTimer(timeDifferenceInSeconds);
      }, 1000);

      return () => BackgroundTimer.clearInterval(intervalRef.current);
    }
  }, [endTime]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      await setupVideoSDKEngine();
      KeepAwake.activate();
      // console.log(route?.params?.details, 'details from home page');
      await joinChannel()
    };
    initialize();
    // return () => {
    //   agoraEngineRef.current?.destroy();
    // };
  }, []);

  const confirmEnd = () => {
    Alert.alert(
      'Confirm End',
      'Are you sure you want to end this session?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => handleTimerEnd(),
        },
      ],
      { cancelable: false }
    );
  };

  const handleTimerEnd = async () => {
    const option = {
      "session_id": route?.params?.details?.id
    };
    try {
      // Retrieve user token
      const userToken = await AsyncStorage.getItem('userToken');
      const savedLang = await AsyncStorage.getItem('selectedLanguage');
      if (!userToken) {
        throw new Error('User token is missing');
      }

      // Make API request
      const res = await axios.post(`${API_URL}/session-end-user`, option, {
        headers: {
          Accept: 'application/json',
          "Authorization": 'Bearer ' + userToken,
          'Accept-Language': savedLang,
        },
      });

      // console.log(res.data);

      if (res.data.response === true) {
        setIsVideoEnabled(false);
       
       
      } else {
        // console.log('Response not OK');
        setIsLoading(false);
        Alert.alert('Oops..', "Something went wrong", [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
      }
    } catch (e) {
      setIsLoading(false);
      console.error('Error during handleTimerEnd:', e);

      // Handle specific API errors if available
      const errorMessage = e.response?.data?.message || 'An unexpected error occurred';
      Alert.alert('Oops..', errorMessage, [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
    }
  };

  const renderChatFooter = useCallback(() => {
    if (imagePath) {
      return (
        <View style={styles.chatFooter}>
          <Image source={{ uri: imagePath }} style={{ height: 75, width: 75 }} />
          <TouchableOpacity
            onPress={() => setImagePath('')}
            style={styles.buttonFooterChatImg}
          >
            <Text style={styles.textFooterChat}>X</Text>
          </TouchableOpacity>
        </View>
      );
    }
    if (filePath) {
      return (
        <View style={styles.chatFooter}>
          <InChatFileTransfer
            filePath={filePath}
          />
          <TouchableOpacity
            onPress={() => setFilePath('')}
            style={styles.buttonFooterChat}
          >
            <Text style={styles.textFooterChat}>X</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }, [filePath, imagePath]);

  const customtInputToolbar = props => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          marginLeft: 15,
          marginRight: 15,
          backgroundColor: "#E8E8E8",
          alignContent: "center",
          justifyContent: "center",
          borderWidth: 0,
          paddingTop: 6,
          borderRadius: 30,
          borderTopColor: "transparent",

        }}
      />
    );
  };

  const customRenderComposer = props => {
    return (
      <Composer
        {...props}
        textInputStyle={{
          color: '#000', // Change this to your desired text color
        }}
      />
    );
  };

  const renderSend = (props) => {
    return (

      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', }}>
        <Send {...props}>
          <Image
            source={sendImg}
            style={styles.imageView2}
          />
        </Send>
      </View>

    );
  };

  const renderBubble = (props) => {
    const { currentMessage } = props;
    if (currentMessage.file && currentMessage.file.url) {
      return (
        <TouchableOpacity
          style={{
            ...styles.fileContainer,
            backgroundColor: props.currentMessage.user._id === 2 ? '#ECFCFA' : '#EAECF0',
            borderBottomLeftRadius: props.currentMessage.user._id === 2 ? 15 : 5,
            borderBottomRightRadius: props.currentMessage.user._id === 2 ? 5 : 15,
          }}
          onPress={() => setFileVisible(true)}
        >

          <View style={{ flexDirection: 'column' }}>
            <Text style={{
              ...styles.fileText,
              color: currentMessage.user._id === 2 ? '#2D2D2D' : '#2D2D2D',
            }} >
              {currentMessage.text}
            </Text>
          </View>
        </TouchableOpacity>
      );
    }
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#FFF5E9',
          },
        }}
        textStyle={{
          right: {
            color: '#2D2D2D',
            fontFamily: 'PlusJakartaSans-Regular'
          },
          left: {
            color: '#2D2D2D',
            fontFamily: 'PlusJakartaSans-Regular'
          },
        }}
        timeTextStyle={{
          left: {
            color: '#8A91A8', // Change the color of timestamp text for left bubbles
          },
          right: {
            color: '#8A91A8', // Change the color of timestamp text for right bubbles
          }
        }}
      />
    );
  };

  const scrollToBottomComponent = () => {
    return <FontAwesome name="angle-double-down" size={28} color="#000" />;
  };

  useEffect(() => {
    const docid = chatgenidres;
    const messageRef = firestore().collection('chatrooms')
      .doc(docid)
      .collection('messages')
      .orderBy('createdAt', "desc")

    const unSubscribe = messageRef.onSnapshot((querySnap) => {
      const allmsg = querySnap.docs.map(docSanp => {
        const data = docSanp.data()
        //console.log(data, 'fetch firebase message');

        if (data.createdAt) {
          return {
            ...docSanp.data(),
            createdAt: docSanp.data().createdAt.toDate()
          }
        } else {
          return {
            ...docSanp.data(),
            createdAt: new Date()
          }
        }

      })
      setMessages(allmsg)
    })


    return () => {
      unSubscribe()
    }
  }, [])

  const onSend = (messageArray) => {
    const msg = messageArray[0]
    const mymsg = {
      ...msg,
      sentBy: therapistId,
      sentTo: patientId,
      createdAt: new Date()
    }
    console.log(mymsg);

    setMessages(previousMessages => GiftedChat.append(previousMessages, mymsg))
    const docid = chatgenidres;
    firestore().collection('chatrooms')
      .doc(docid)
      .collection('messages')
      .add({ ...mymsg, createdAt: firestore.FieldValue.serverTimestamp() })


  }


  // audio call 
  const agoraEngineRef = useRef(null); // IRtcEngine instance
  const [isJoined, setIsJoined] = useState(false);
  const [remoteUid, setRemoteUid] = useState(null);
  const [localUid, setLocalUid] = useState(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isVideLoading, setIsVideLoading] = useState(true);

  const setupVideoSDKEngine = async () => {
    try {
      if (Platform.OS === 'android') {
        await getPermission(); // Await for permission request
      }

      agoraEngineRef.current = createAgoraRtcEngine(); // Await for engine creation
      const agoraEngine = agoraEngineRef.current;

      if (agoraEngine) {
        console.log('Agora engine created successfully');
      } else {
        console.log('Failed to create Agora engine');
      }

      await agoraEngine.initialize({
        appId: appId,
      }); // Await for initialization

      await agoraEngine.registerEventHandler({
        onJoinChannelSuccess: (connection, localUid, elapsed) => {
           console.log('Successfully joined the channel: ' + channelName);
          // alert('Successfully joined the channel: ' + channelName)
          setLocalUid(0);
          setIsJoined(true);
        },
        onUserJoined: (_connection, Uid) => {
          // console.log('Remote user ' + Uid + ' has joined');
          // alert('Remote user ' + Uid + ' has joined')
          setRemoteUid(Uid);
        },
        onUserOffline: (_connection, Uid) => {
          // console.log('Remote user ' + Uid + ' has left the channel');
          // alert('Remote user ' + Uid + ' has left the channel')
          setRemoteUid(null);
        },
      });

    } catch (e) {
      console.log(e);
    }
  };
  const getPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      return granted;
    } catch (err) {
      console.warn(err);
    }
  };

  const toggleMic = () => {
    try {
      const agoraEngine = agoraEngineRef.current;
      if (micOn) {
        agoraEngine?.muteLocalAudioStream(true);
      } else {
        agoraEngine?.muteLocalAudioStream(false);
      }
      setMicOn(!micOn);
    } catch (e) {
      console.log(e);
    }
  };

  const toggleSpeaker = () => {
    try {
      const agoraEngine = agoraEngineRef.current;
      if (speakerOn) {
        agoraEngine?.setEnableSpeakerphone(false);
      } else {
        agoraEngine?.setEnableSpeakerphone(true);
      }
      setSpeakerOn(!speakerOn);
    } catch (e) {
      console.log(e);
    }
  };

 
  // Define the join method called after clicking the join channel button
  const joinChannel = async () => {
    const agoraEngine = agoraEngineRef.current;

    if (!agoraEngine) {
      // console.log('Agora engine is not initialized');
      return;
    }

    try {
      // Set channel profile
      await agoraEngine.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);

      // Start video preview
      await agoraEngine.startPreview();
      await agoraEngine.muteLocalVideoStream(false)
      await agoraEngine?.muteLocalAudioStream(false)
      // Join the channel
      await agoraEngine.joinChannel(token, channelName, uid, {
        clientRoleType: ClientRoleType.ClientRoleBroadcaster,
      });
      setIsVideLoading(false)
      setCameraOn(true);
      //console.log('Successfully joined the channel: ' + channelName);
    } catch (error) {
      console.log('Error joining channel:', error);
      console.log('Failed to join the channel. Please try again.');
      setIsVideLoading(false)
    }
  };


  const leaveChannel = async () => {
    try {
      const agoraEngine = agoraEngineRef.current;
      await agoraEngine?.leaveChannel();
      setRemoteUid(null);
      setIsJoined(false);
      setIsVideoEnabled(false);
      setMicOn(true); // Ensure mic is on when leaving the channel
      setSpeakerOn(true); // Ensure speaker is on when leaving the channel
      // console.log('You left the channel');
    } catch (e) {
      console.log(e);
    }

  };

  const startVideoCall = async () => {
    const agoraEngine = agoraEngineRef.current;
    await agoraEngine?.enableVideo();
    setIsVideoEnabled(true);
  };

  const startAudioCall = async () => {
    const agoraEngine = agoraEngineRef.current;
    await agoraEngine?.disableVideo();
    await agoraEngine?.muteLocalAudioStream(false);
    setIsVideoEnabled(false);
  };

  const goingToactiveTab = async (name) => {
    if (name === 'audio') {
      await startAudioCall();
      const agoraEngine = agoraEngineRef.current;
      await agoraEngine?.muteLocalAudioStream(false);
      setActiveTab('audio');
      setIsVideoEnabled(false);
    } else if (name === 'chat') {
      const agoraEngine = agoraEngineRef.current;
      await agoraEngine?.muteLocalAudioStream(true);
      setActiveTab('chat');
      setIsVideoEnabled(false);
    }
  };

  const requestToTabSwitch = async (name) => {
    setIsLoading(true);
    const option = {
      "booked_slot_id": route?.params?.details?.id,
      "flag": name
    };
    // console.log(option);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const savedLang = await AsyncStorage.getItem('selectedLanguage');
      if (!userToken) {
        throw new Error('User token is missing');
      }
      const res = await axios.post(`${API_URL}/notification/tab-switch`, option, {
        headers: {
          Accept: 'application/json',
          "Authorization": 'Bearer ' + userToken,
          'Accept-Language': savedLang,
        },
      });
      // console.log(res.data);
      if (res.data.response === true) {
        setIsLoading(false);
        await goingToactiveTab(name);
      } else {
        // console.log('Response not OK');
        setIsLoading(false);
        Alert.alert('Oops..', "Something went wrong", [
          {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
          },
          { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
      }
    } catch (e) {
      setIsLoading(false);
      console.error('Error during handleTimerEnd:', e);
      const errorMessage = e.response?.data?.message || 'An unexpected error occurred';
      Alert.alert('Oops..', errorMessage, [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
    }
  }
  useEffect(() => {
    if (Platform.OS == 'android') {
      /* this is app foreground notification */
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        // Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
         console.log('Received background message:', JSON.stringify(remoteMessage));
        if (remoteMessage?.data?.screen === 'ChatScreen') {
          Alert.alert(
            'Hello',
            `The therapist wants to switch to ${remoteMessage?.data?.flag}. Do you agree?`,
            [
              {
                text: 'Cancel',
                onPress: () => console.log('cancel pressed'),
                style: 'cancel',
              },
              {
                text: 'OK',
                onPress: () => goingToactiveTab(remoteMessage?.data?.flag),
              },
            ],
            {
              cancelable: true,
              onDismiss: () =>
                console.log('cancel')
            },
          );

        }else if(remoteMessage?.data?.screen === 'Session End'){
          await leaveChannel(); // Ensure leave completes before navigating
          const parsedData = JSON.parse(remoteMessage?.data?.data);
          navigation.navigate('ReviewScreen', {details: parsedData})
        }
      });
      return unsubscribe;
    }
  }, [])

  useEffect(() => {
    console.log(route?.params?.details, 'detailssssssssss')
    setBirthDetailsText(route?.params?.details.share_birth_details)
    if (route?.params?.commingFrom === 'from_chat') {
      goingToactiveTab('chat')
    } else {
      goingToactiveTab('audio')
    }
  }, [])

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container} behavior="padding" keyboardVerticalOffset={30} enabled>
      {/* <CustomHeader commingFrom={'chat'} onPress={() => navigation.goBack()} title={'Admin Community'} /> */}
      <View style={styles.HeaderSection}>
        <View style={styles.HeaderSectionHalf}>
          <Ionicons name="chevron-back" size={25} color="#000" />
          <View style={{ flexDirection: 'column', marginLeft: 10 }}>
            <Text style={styles.therapistName}>{route?.params?.details?.user?.full_name}</Text>
            <Text style={styles.timerText}>{formatTime(timer)}</Text>
          </View>
        </View>
        <View style={styles.HeaderSectionHalf}>
          {/* <TouchableOpacity onPress={() => setActiveTab(activeTab === 'chat' ? 'audio' : 'chat')}>
            <Image source={activeTab == 'chat' ? callIconImg : chatIconImg} style={[styles.iconStyle, { marginRight: responsiveWidth(3) }]} />
          </TouchableOpacity>  */}

          <TouchableOpacity onPress={() => toggleModal()}>
            <Image source={chatInfoImg} style={[styles.iconStyle, { marginRight: responsiveWidth(3) }]} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => confirmEnd()}>
            <View style={styles.endButtonView}>
              <Text style={styles.endButtonText}>End</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.containSection, { paddingBottom: activeTab === 'chat' ? 5 : 0 }]}>
        {activeTab == 'chat' ?
          <GiftedChat
            messages={messages}
            renderInputToolbar={props => customtInputToolbar(props)}
            renderComposer={customRenderComposer}
            renderBubble={renderBubble}
            isTyping
            alwaysShowSend
            scrollToBottom
            scrollToBottomComponent={scrollToBottomComponent}
            renderChatFooter={renderChatFooter}
            renderSend={renderSend}
            onSend={messages => onSend(messages)}
            style={styles.messageContainer}
            user={{
              _id: therapistId,
              //avatar: { uri: patientProfilePic },
            }}
            renderAvatar={null}
          //user={user}
          />
          : activeTab == 'audio' ?
            <>
              <LinearGradient
                colors={['#FEF3E5', '#FFFFFF']} // Replace with your gradient colors
                style={styles.AudioBackground}   // The style for the gradient background
              >
                {route?.params?.details?.user?.profile_pic ?
                  <Image
                    source={{ uri: route?.params?.details?.user?.profile_pic }}
                    style={styles.buttonImage}
                  /> :
                  <Image
                    source={defaultUserImg}
                    style={styles.buttonImage}
                  />
                }
                <Text style={styles.audioSectionTherapistName}>{route?.params?.details?.user?.full_name}</Text>
                <View style={styles.audioButtonSection}>
                  {micOn ?
                    <TouchableOpacity onPress={() => toggleMic()}>
                      <Image
                        source={audioonIcon}
                        style={styles.iconStyle}
                      />
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={() => toggleMic()}>
                      <Image
                        source={audiooffIcon}
                        style={styles.iconStyle}
                      />
                    </TouchableOpacity>}
                  {speakerOn ?
                    <TouchableOpacity onPress={() => toggleSpeaker()}>
                      <Image
                        source={speakeronIcon}
                        style={styles.iconStyle}
                      />
                    </TouchableOpacity> :
                    <TouchableOpacity onPress={() => toggleSpeaker()}>
                      <Image
                        source={speakeroffIcon}
                        style={styles.iconStyle}
                      />
                    </TouchableOpacity>}
                </View>
              </LinearGradient>
            </>
            :
            null
        }
      </View>
      <Modal
        isVisible={isModalVisible}
        // onBackdropPress={() => setIsFocus(false)} // modal off by clicking outside of the modal
        style={{
          margin: 0, // Add this line to remove the default margin
          justifyContent: 'flex-end',
        }}>
        <View style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', height: 50, width: 50, borderRadius: 25, position: 'absolute', bottom: '25%', left: '45%', right: '45%' }}>
          <Icon name="cross" size={30} color="#B0B0B0" onPress={toggleModal} />
        </View>
        {/* <TouchableWithoutFeedback onPress={() => setIsFocus(false)} style={{  }}> */}
        <View style={{ height: '20%', backgroundColor: '#fff', position: 'absolute', bottom: 0, width: '100%' }}>
          <View style={{ paddingVertical: 10, paddingHorizontal: 10 }}>
            <Text style={{ color: '#2D2D2D', fontFamily: 'PlusJakartaSans-Bold', fontSize: responsiveFontSize(2) }}>Full Name: {birthDetailsText?.full_name}</Text>
            <Text style={{ color: '#2D2D2D', fontFamily: 'PlusJakartaSans-Bold', fontSize: responsiveFontSize(2) }}>Date of Birth: {birthDetailsText?.date_of_birth}</Text>
            <Text style={{ color: '#2D2D2D', fontFamily: 'PlusJakartaSans-Bold', fontSize: responsiveFontSize(2) }}>Gender: {birthDetailsText?.gender}</Text>
            <Text style={{ color: '#2D2D2D', fontFamily: 'PlusJakartaSans-Bold', fontSize: responsiveFontSize(2) }}>Marital Status: {birthDetailsText?.martial_status}</Text>
            <Text style={{ color: '#2D2D2D', fontFamily: 'PlusJakartaSans-Bold', fontSize: responsiveFontSize(2) }}>Place of Birth: {birthDetailsText?.place_of_birth}</Text>
            <Text style={{ color: '#2D2D2D', fontFamily: 'PlusJakartaSans-Bold', fontSize: responsiveFontSize(2) }}>Time of Birth: {birthDetailsText?.time_of_birth}</Text>
          </View>
        </View>
        {/* </TouchableWithoutFeedback> */}
      </Modal>
    </SafeAreaView>
  )
}

export default withTranslation()(ChatScreen)

const styles = StyleSheet.create({
  Container: {
    flex: 1,
    backgroundColor: '#EAECF0',
    paddingBottom: 10,
  },
  HeaderSection: { height: responsiveHeight(10), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 5, backgroundColor: '#FEF3E5' },
  HeaderSectionHalf: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  therapistName: { color: '#2D2D2D', fontFamily: 'PlusJakartaSans-Bold', fontSize: responsiveFontSize(2) },
  therapistDesc: { color: '#444343', fontFamily: 'PlusJakartaSans-Medium', fontSize: responsiveFontSize(1.7) },
  timerText: { color: '#CC2131', fontFamily: 'PlusJakartaSans-Medium', fontSize: responsiveFontSize(1.7), marginRight: responsiveWidth(5) },
  endButtonView: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#FB7401', borderRadius: 15, marginLeft: responsiveWidth(2) },
  endButtonText: { color: '#FFF', fontFamily: 'PlusJakartaSans-SemiBold', fontSize: responsiveFontSize(1.5) },
  TabSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 },
  ButtonView: { width: responsiveWidth(45), height: responsiveHeight(6), backgroundColor: '#fff', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  ButtonImg: { height: 20, width: 20, resizeMode: 'contain', marginRight: 5 },
  ButtonText: { color: '#2D2D2D', fontFamily: 'PlusJakartaSans-Medium', fontSize: responsiveFontSize(1.7) },
  containSection: { height: responsiveHeight(90), width: responsiveWidth(100), backgroundColor: '#FFF', position: 'absolute', bottom: 0 },
  AudioBackground: { flex: 1, width: responsiveWidth(100), justifyContent: 'center', alignItems: 'center' },
  buttonImage: { height: 150, width: 150, borderRadius: 150 / 2, marginTop: - responsiveHeight(20) },
  audioSectionTherapistName: { color: '#2D2D2D', fontSize: responsiveFontSize(2.6), fontFamily: 'PlusJakartaSans-Bold', marginTop: responsiveHeight(2), marginBottom: responsiveHeight(2) },
  audioButtonSection: { backgroundColor: '#EFDFC9', height: responsiveHeight(8), width: responsiveWidth(40), borderRadius: 50, alignItems: 'center', position: 'absolute', bottom: 40, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' },
  videoButtonSection: { backgroundColor: '#000', height: responsiveHeight(8), width: responsiveWidth(60), borderRadius: 50, alignItems: 'center', position: 'absolute', bottom: 40, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', alignSelf: 'center' },
  iconStyle: { height: 35, width: 35 },
  messageContainer: {
    backgroundColor: 'red',
    height: responsiveHeight(70)
  },
  imageView1: {
    width: 30,
    height: 30,
    marginBottom: responsiveFontSize(1)
  },
  imageView2: {
    width: 30,
    height: 30,
    marginBottom: responsiveHeight(2)
  },
  chatFooter: {
    shadowColor: '#ECFCFA',
    shadowOpacity: 0.37,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    flexDirection: 'row',
    padding: 5,
    backgroundColor: 'blue',
    marginBottom: 10
  },
  buttonFooterChat: {
    width: 25,
    height: 25,
    borderRadius: 25 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    //position: 'absolute',
    borderColor: 'black',
    right: 10,
    top: -5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  buttonFooterChatImg: {
    width: 25,
    height: 25,
    borderRadius: 25 / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'black',
    //position: 'absolute',
    right: 10,
    top: -5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  textFooterChat: {
    fontSize: responsiveFontSize(2),
    fontWeight: 'bold',
    color: 'black',
  },
  fileContainer: {
    flex: 1,
    maxWidth: 300,
    marginVertical: 2,
    borderRadius: 15,
  },
  fileText: {
    marginVertical: 5,
    fontSize: 16,
    lineHeight: 20,
    marginLeft: 10,
    marginRight: 5,
    color: '#2D2D2D'
  },
  textTime: {
    fontSize: 10,
    color: '#2D2D2D',
    marginLeft: 2,
  },
  agoraStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 50, // Adjust the radius as needed
    overflow: 'hidden', // Ensure child components respect the borderRadius
  },
  localVideo: {
    width: '30%',
    height: 200,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  remoteVideo: {
    width: '100%',
    height: '100%',
  },

});