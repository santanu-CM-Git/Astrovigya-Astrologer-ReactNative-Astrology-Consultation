import React, { useState, useCallback, useEffect, useRef } from 'react'
import { View, Text, SafeAreaView, StyleSheet, ScrollView, ImageBackground, Image, PermissionsAndroid, Alert, BackHandler, Platform } from 'react-native'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { GreenTick, audiooffIcon, audioonIcon, callIcon, chatImg, filesendImg, sendImg } from '../../utils/Images'
import { GiftedChat, InputToolbar, Bubble, Send, Composer } from 'react-native-gifted-chat'
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import InChatFileTransfer from '../../components/InChatFileTransfer';
import { TabActions, useNavigation, useRoute } from '@react-navigation/native';
import firestore, { endBefore } from '@react-native-firebase/firestore'
import Ionicons from 'react-native-vector-icons/Ionicons';
import messaging from '@react-native-firebase/messaging';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Entypo';

import moment from 'moment-timezone'
import Loader from '../../utils/Loader'
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import { useFocusEffect } from '@react-navigation/native';
import { withTranslation, useTranslation } from 'react-i18next';
import CustomHeader from '../../components/CustomHeader'



const ChatHistory = ({ route }) => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation(); 
  const routepage = useRoute();


  const [messages, setMessages] = useState([])
  const [astrologerId, setAstrologerId] = useState(route?.params?.astrologerId)
  const [usersId, setUsersId] = useState(route?.params?.userId)
  const [chatgenidres, setChatgenidres] = useState(route?.params?.Uid);
  const [imagePath, setImagePath] = useState('');
  const [filePath, setFilePath] = useState('');
  const [fileVisible, setFileVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const intervalRef = useRef(null);
  const [refresh, setRefresh] = useState(false); // State to trigger refresh

  useFocusEffect(
    useCallback(() => {
      setRefresh(prev => !prev); // Toggle refresh state on focus
    }, [])
  );


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
    const docid = route?.params?.Uid;
    console.log(docid, 'unique idddd useEffect')
    const messageRef = firestore().collection('chatrooms')
      .doc(docid)
      .collection('messages')
      .orderBy('createdAt', "desc")

    const unSubscribe = messageRef.onSnapshot((querySnap) => {
      const allmsg = querySnap.docs.map(docSanp => {
        const data = docSanp.data()
        console.log(data, 'fetch firebase message');

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
  }, [chatgenidres, refresh,route.params?.Uid])

  useFocusEffect(
    useCallback(() => {
      if (route.params?.Uid) {
        setChatgenidres(route.params.Uid);
      }
      const docid = route.params.Uid;
      console.log(docid, 'unique idddd useFocusEffect')
      const messageRef = firestore().collection('chatrooms')
        .doc(docid)
        .collection('messages')
        .orderBy('createdAt', "desc")

      const unSubscribe = messageRef.onSnapshot((querySnap) => {
        const allmsg = querySnap.docs.map(docSanp => {
          const data = docSanp.data()
          console.log(data, 'fetch firebase message');

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
    }, [route.params?.Uid])
  );

  const onSend = (messageArray) => {
    const msg = messageArray[0]
    const mymsg = {
      ...msg,
      sentBy: usersId,
      sentTo: astrologerId,
      createdAt: new Date()
    }
    console.log(mymsg, 'dsfdsfdsfdsfdsfdsf');

    setMessages(previousMessages => GiftedChat.append(previousMessages, mymsg))
    const docid = chatgenidres;
    firestore().collection('chatrooms')
      .doc(docid)
      .collection('messages')
      .add({ ...mymsg, createdAt: firestore.FieldValue.serverTimestamp() })


  }


  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.Container} behavior="padding" keyboardVerticalOffset={30} enabled>
      <CustomHeader commingFrom={'others'} onPress={() => navigation.goBack()} title={"Chat History"} />
      {/* <View style={styles.HeaderSection}>
        <View style={styles.HeaderSectionHalf}>
          <TouchableOpacity onPress={() => navigation.navigate('OrderHistory')}>
            <Ionicons name="chevron-back" size={25} color="#000" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'column', marginLeft: 10 }}>
            <Text style={styles.therapistName}>{route?.params?.astrologerName}</Text>
          </View>
        </View>
        <View style={styles.HeaderSectionHalf}>
          <TouchableOpacity onPress={() => navigation.navigate('AstrologerProfile', { astrologerId: astrologerId })}>
            <View style={styles.endButtonView}>
              <Text style={styles.endButtonText}>{t('chathistory.ConsultAgain')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View> */}
      <View style={[styles.containSection, { paddingBottom: responsiveHeight(10) }]}>
        {messages.length != 0 ?
          <GiftedChat
            messages={messages}
            renderInputToolbar={() => null}
            renderComposer={null}
            renderBubble={renderBubble}
            isTyping
            alwaysShowSend={false}
            scrollToBottom
            scrollToBottomComponent={scrollToBottomComponent}
            renderChatFooter={renderChatFooter}
            renderSend={() => null}
            onSend={messages => onSend(messages)}
            style={styles.messageContainer}
            user={{
              _id: usersId,
              //avatar: { uri: patientProfilePic },
            }}
            renderAvatar={null}
          //user={user}
          /> :
          <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
          <Text style={{color: '#2D2D2D', fontSize: responsiveFontSize(2.6), fontFamily: 'PlusJakartaSans-Bold',}}>No Chat History found</Text>
          </View>
        }

      </View>
    </SafeAreaView>
  )
}

export default withTranslation()(ChatHistory)

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
  containSection: { height: responsiveHeight(90), width: responsiveWidth(100), backgroundColor: '#FFF',},
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