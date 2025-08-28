import React, { useContext, useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import DocumentPicker from 'react-native-document-picker';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { dateIcon, pagination1Img, plus, uploadImg, uploadPicImg, userPhoto } from '../../utils/Images';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../utils/Loader';
import axios from 'axios';
import { API_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import MultiSelect from 'react-native-multiple-select';
import { Dropdown } from 'react-native-element-dropdown';
import Toast from 'react-native-toast-message';
import RNDateTimePicker from '@react-native-community/datetimepicker'
import StepIndicator from '../../components/StepIndicator';
import { withTranslation, useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import moment from 'moment-timezone';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context'

const dataGender = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Others', value: 'Others' }
];

const PersonalInformation = ({ route }) => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1)
  const { t, i18n } = useTranslation();
  const [langvalue, setLangValue] = useState('en');

  const [firstname, setFirstname] = useState('');
  const [firstNameError, setFirstNameError] = useState('')
  const [displayname, setDisplayname] = useState('');
  const [displayNameError, setDisplayNameError] = useState('')
  const [email, setEmail] = useState(route?.params?.email);
  const [emailError, setEmailError] = useState('')
  const [phoneno, setPhoneno] = useState(route?.params?.phoneno);
  const [phonenoError, setPhonenoError] = useState('')

  const MIN_DATE = new Date(1930, 0, 1)
  const MAX_DATE = new Date()
  const [date, setDate] = useState('DD - MM  - YYYY')
  const [selectedDOB, setSelectedDOB] = useState(MAX_DATE)
  const [open, setOpen] = useState(false)
  const [dobError, setdobError] = useState('')

  const [documentError, setDocumentError] = useState('')
  const [pickedDocument, setPickedDocument] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isPicUploadLoading, setIsPicUploadLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const { login, userToken } = useContext(AuthContext);

  const [gendervalue, setGenderValue] = useState(null);
  const [isGenderFocus, setGenderIsFocus] = useState(false);
  const [genderError, setGenderError] = useState('')

  useEffect(() => {
    // Load language from AsyncStorage when the component mounts
    const loadLanguage = async () => {
      try {
        const savedLang = await AsyncStorage.getItem('selectedLanguage');
        if (savedLang) {
          setLangValue(savedLang);
          i18n.changeLanguage(savedLang);
        }
      } catch (error) {
        console.error('Failed to load language from AsyncStorage', error);
      }
    };

    loadLanguage();
  }, []);

  const changeFirstname = (text) => {
    setFirstname(text)
    if (text) {
      setFirstNameError('')
    } else {
      setFirstNameError('Please enter Name')
    }
  }

  const changeEmail = (text) => {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(text) === false) {
      console.log("Email is Not Correct");
      setEmail(text)
      setEmailError(t('login.PleaseentercorrectEmailId'))
      return false;
    }
    else {
      setEmailError('')
      console.log("Email is Correct");
      setEmail(text)
    }
  }

  const changePhone = (text) => {
    let phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(text)) {
      setPhoneno(text)
      setPhonenoError(t('login.Pleaseentera10digitnumber'))
      return false;
    } else {
      setPhonenoError('')
      setPhoneno(text)
    }
  }

  const pickDocument = async () => { 
    console.log('pickDocument called');
    try {
        const options = {
            mediaType: 'photo',
            includeBase64: false,
            maxHeight: 2000,
            maxWidth: 2000,
        };

        DocumentPicker.pick({
            type: DocumentPicker.types.images,
            copyTo: 'cachesDirectory',
        }).then(response => {
            if (response.length > 0) {
                const pickedDocument = response[0];
                setPickedDocument(pickedDocument);
                setDocumentError('');
            }
        }).catch(err => {
            if (DocumentPicker.isCancel(err)) {
                console.log('Document picker was cancelled');
                return;
            }
            console.log('DocumentPicker Error: ', err);
            handleAlert('Oops..', err.message);
            setIsPicUploadLoading(false);
        });

    } catch (err) {
        setIsPicUploadLoading(false);
        console.error('Error picking document', err);
        handleAlert('Oops..', 'An error occurred while picking the image');
    }
};


  const submitForm = async() => {
    const savedLang = await AsyncStorage.getItem('selectedLanguage');
    //navigation.navigate('DocumentsUpload')
    if (!pickedDocument) {
      setDocumentError(t('personalinformation.Pleaseselectoneprofilepic'))
    } else if (!firstname) {
      setFirstNameError(t('personalinformation.PleaseenterName'))
    } else if (!displayname) {
      setDisplayNameError(t('personalinformation.PleaseenterDisplayName'))
    } else if (!email) {
      setEmailError(t('personalinformation.PleaseenterEmailId'))
    } else if (!phoneno) {
      setPhonenoError(t('personalinformation.PleaseenterMobileNo'))
    } else if (date === 'DD - MM  - YYYY') {
      setdobError(t('personalinformation.PleaseenterDateofbirth'))
    } else if (!gendervalue) {
      setGenderError(t('personalinformation.Pleasechooseyourgender'))
    } else {
      const formData = new FormData();
      if (pickedDocument) {
        formData.append("profile_pic", {
          uri: pickedDocument.uri,
          type: pickedDocument.type || 'image/jpeg',
          name: pickedDocument.name || 'photo.jpg',
        });
      } else {
        formData.append("profile_pic", "");
      }
      formData.append("full_name", firstname);
      formData.append("display_name", displayname);
      formData.append("email", email);
      formData.append("mobile", phoneno);
      formData.append("dob", date);
      formData.append("gender", gendervalue);

      console.log(JSON.stringify(formData), 'form data')
      setIsLoading(true)
      axios.post(`${API_URL}/astrologer/registration-first`, formData, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'multipart/form-data',
          "Authorization": 'Bearer ' + route?.params?.token,
          'Accept-Language': savedLang,
        },
      })
        .then(res => {
          console.log(res.data, 'response from register first')
          if (res.data.response == true) {
            setIsLoading(false)
            navigation.navigate('PersonalInformationTwo', { token: route?.params?.token })
          } else {
            console.log('not okk')
            setIsLoading(false)
            Alert.alert('Oops..', "Something went wrong", [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              { text: 'OK', onPress: () => console.log('OK Pressed') },
            ]);
          }
        })
        .catch(e => {
          setIsLoading(false)
          console.log(`user register error ${e}`)
          console.log(e.response)
          Alert.alert('Oops..', e.response?.data?.message, [
            {
              text: 'Cancel',
              onPress: () => console.log('Cancel Pressed'),
              style: 'cancel',
            },
            { text: 'OK', onPress: () => console.log('OK Pressed') },
          ]);
        });
    }
  }

  // const submitForm = () => {
  //   navigation.navigate('PersonalInformationTwo', { token: route?.params?.token })
  // }

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(4) }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 25 }}>
          <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.wrapper}>
          <Text style={styles.header1}>{t('personalinformation.header')}</Text>
          <Text style={styles.subheader}>{t('personalinformation.subheader')}</Text>
          <StepIndicator currentStep={currentStep} />
          <View style={styles.textinputview}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.mainView}>
                <View style={styles.imageContainer}>
                  {isPicUploadLoading ? (
                    <ActivityIndicator size="small" color="#417AA4" style={styles.loader} />
                  ) : (
                    pickedDocument == null ? (
                      imageFile != null ? (
                        <Image source={{ uri: imageFile }} style={styles.profileStyle} />
                      ) : (
                        <Image source={userPhoto} style={styles.profileStyle} />
                      )
                    ) : (
                      <Image source={{ uri: pickedDocument.uri }} style={styles.profileStyle} />
                    )
                  )}
                </View>
                <TouchableOpacity style={styles.plusIcon} onPress={pickDocument}>
                  <Image source={plus} style={styles.iconStyle} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(3) }}>
                <Text style={styles.header}>{t('personalinformation.uploadphoto')}</Text>
                <Text style={styles.subheader}>{t('personalinformation.uploadphoto2')}</Text>
                {documentError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{documentError}</Text> : <></>}
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.fullname')}</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {firstNameError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{firstNameError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={t('personalinformation.enterfullname')}
                keyboardType=" "
                value={firstname}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => changeFirstname(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.displayname')}</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {displayNameError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{displayNameError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={t('personalinformation.enterdisplayname')}
                keyboardType=" "
                value={displayname}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => setDisplayname(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.email')}</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {emailError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{emailError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'e.g. abc@gmail.com'}
                keyboardType=" "
                value={email}
                //helperText={'Please enter lastname'}
                inputType={route?.params?.email ? 'nonedit' : 'others'}
                onChangeText={(text) => changeEmail(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.mobile')}</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {phonenoError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{phonenoError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={t('personalinformation.mobileplaceholder')}
                keyboardType=" "
                value={phoneno}
                //helperText={firstNameError}
                inputType={route?.params?.phoneno ? 'nonedit' : 'others'}
                onChangeText={(text) => changePhone(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.dob')}</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {dobError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{dobError}</Text> : <></>}
            <TouchableOpacity onPress={() => setOpen(true)}>
              <View style={styles.dateView}>
                <Text style={styles.dayname}>  {date}</Text>
                {/* <Entypo name="calendar" size={22} color="#000" /> */}
                <Image
                  source={dateIcon}
                  style={styles.imageStyle}
                />
              </View>
            </TouchableOpacity>
            {open == true ?
              <RNDateTimePicker
                mode="date"
                display='spinner'
                value={selectedDOB}
                textColor={'#000'}
                minimumDate={MIN_DATE}
                // maximumDate={MAX_DATE}
                themeVariant="light"
                onChange={(event, selectedDate) => {
                  // console.log(moment(selectedDate).format('DD-MM-YYYY'),'jjjjj');
                  // const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
                  //   console.log(formattedDate,'nnnnnnnnnn');
                  //   setSelectedDOB(selectedDate);
                  //   setDate(formattedDate);
                  console.log(selectedDate, 'datedatedate');
                  if (selectedDate) {
                    const formattedDate = moment(selectedDate).format('DD-MM-YYYY');
                    console.log(formattedDate, 'datedatedate');
                    setOpen(false)
                    setSelectedDOB(selectedDate);
                    setDate(formattedDate);
                    setdobError('')
                  } else {
                    // User canceled the picker
                    setOpen(false)
                  }

                }}
              /> : null}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.gender')}</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {genderError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{genderError}</Text> : <></>}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Dropdown
                style={[styles.dropdownHalf, isGenderFocus && { borderColor: '#DDD' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.selectedTextStyle}
                data={dataGender}
                //search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isGenderFocus ? t('personalinformation.selectgender') : '...'}
                searchPlaceholder="Search..."
                value={gendervalue}
                onFocus={() => setGenderIsFocus(true)}
                onBlur={() => setGenderIsFocus(false)}
                onChange={item => {
                  setGenderValue(item.value);
                  setGenderIsFocus(false);
                  setGenderError('')
                }}
              />
            </View>
          </View>
        </View>
        <View style={styles.buttonwrapper}>
          <CustomButton label={t('personalinformation.savenext')}
            //onPress={() => { navigation.navigate('Thankyou') }}
            onPress={() => { submitForm() }}
          />
        </View>
      </KeyboardAwareScrollView>

    </SafeAreaView >
  );
};

export default withTranslation()(PersonalInformation);

const styles = StyleSheet.create({

  container: {
    //justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  wrapper: {
    paddingHorizontal: 15,
    marginBottom: responsiveHeight(5),
  },
  header1: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: responsiveFontSize(2.5),
    color: '#2F2F2F',
    marginBottom: responsiveHeight(1),
  },
  header: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: responsiveFontSize(1.7),
    color: '#2F2F2F',
    marginBottom: responsiveHeight(1),
  },
  requiredheader: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: responsiveFontSize(1.5),
    color: '#E1293B',
    marginBottom: responsiveHeight(1),
    marginLeft: responsiveWidth(1)
  },
  subheader: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: responsiveFontSize(1.8),
    fontWeight: '400',
    color: '#808080',
    marginBottom: responsiveHeight(1),
  },
  photoheader: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: responsiveFontSize(2),
    color: '#2F2F2F'
  },
  imageView: {
    marginTop: responsiveHeight(2)
  },
  imageStyle: {
    height: 20,
    width: 20,
  },
  textinputview: {
    marginBottom: responsiveHeight(10),
    marginTop: responsiveHeight(2)
  },
  inputView: {
    paddingVertical: 1
  },
  buttonwrapper: {
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 10,
    width: responsiveWidth(100),
  },
  searchInput: {
    color: '#333',
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 10,
    //borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 5
  },
  dropdownMenu: {
    backgroundColor: '#FFF',
    height: responsiveHeight(4.6),
    paddingTop: 3,
  },
  dropdownMenuSubsection: {
    borderBottomWidth: 0,
    height: responsiveHeight(5.2),
    marginTop: 5
  },
  mainWrapper: {
    flex: 1,
  },
  dropdownHalf: {
    height: responsiveHeight(6),
    width: responsiveWidth(92),
    borderColor: '#DDD',
    borderWidth: 0.7,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginTop: 5,
    marginBottom: responsiveHeight(4)
  },
  placeholderStyle: {
    fontSize: responsiveFontSize(1.8),
    color: '#2F2F2F',
    fontFamily: 'PlusJakartaSans-Regular'
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#2F2F2F'
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: '#2F2F2F'
  },
  paginationImg: {
    height: responsiveHeight(10),
    width: responsiveWidth(90),
    resizeMode: 'contain',
    alignSelf: "center"
  },
  dateView: { height: responsiveHeight(6), width: responsiveWidth(92), borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: responsiveHeight(2), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 },
  dayname: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: responsiveFontSize(1.7),
    color: '#808080',
  },
  mainView: {
    alignSelf: 'flex-start',
    marginTop: responsiveHeight(2)
  },
  imageContainer: {
    height: 90,
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  loader: {
    position: 'absolute',
  },
  plusIcon: {
    position: 'absolute',
    bottom: 20,
    left: 60
  },
  iconStyle: { height: 25, width: 25, resizeMode: 'contain' },
  profileStyle: {
    height: 80,
    width: 80,
    borderRadius: 40,
    marginBottom: 10
  },
  //pagination image
  paginationcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: responsiveHeight(1)
  },
  stepContainer: {
    alignItems: 'center',
  },
  circle: {
    width: 25,
    height: 25,
    borderRadius: 25 / 2,
    backgroundColor: '#d3d3d3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeCircle: {
    backgroundColor: '#ff7f0e',
  },
  number: {
    color: '#fff',
  },
  activeNumber: {
    color: '#fff',
  },
  label: {
    marginTop: 5,
    color: '#808080',
  },
  activeLabel: {
    color: '#000',
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: responsiveFontSize(1.7),
  },
  line: {
    width: responsiveWidth(15),
    height: 1,
    backgroundColor: '#d3d3d3',
  },
});
