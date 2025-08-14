import React, { useContext, useState, useRef, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import DocumentPicker from 'react-native-document-picker';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { dateIcon, deleteRoundImg, pagination1Img, pagination3Img, plus, uploadImg, uploadPicImg, userPhoto } from '../../utils/Images';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../utils/Loader';
import axios from 'axios';
import { API_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Dropdown } from 'react-native-element-dropdown';
import Toast from 'react-native-toast-message';
import CheckBox from '@react-native-community/checkbox';
import StepIndicator from '../../components/StepIndicator';
import { withTranslation, useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

// const dataAddressProof = [
//   { label: 'Male', value: 'Male' },
//   { label: 'Female', value: 'Female' },
//   { label: 'Others', value: 'Others' }
// ];
// const dataGovId = [
//   { label: '01', value: '1' },
//   { label: '02', value: '2' },
//   { label: '03', value: '3' },
//   { label: '04', value: '4' },
//   { label: '05', value: '5' },
//   { label: '06', value: '6' },
//   { label: '07', value: '7' },
//   { label: '08', value: '8' },
//   { label: '09', value: '9' },
//   { label: '10', value: '10' },
// ];

const PersonalInformationThree = ({ route }) => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [langvalue, setLangValue] = useState('en');
  const [currentStep, setCurrentStep] = useState(3) 
  const [pickedGovId, setPickedGovId] = useState(null);
  const [pickedGovIdIMG, setPickedGovIdIMG] = useState(null);
  const [govidError, setgovidError] = useState('')

  const [pickedAddressProof, setPickedAddressProof] = useState(null);
  const [pickedAddressProofIMG, setPickedAddressProofIMG] = useState(null);
  const [AddressProofError, setAddressProofError] = useState('')

  const [facebooklink, setFacebooklink] = useState('');
  const [instagramlink, setInstagramlink] = useState('');
  const [linkedinlink, setLinkedinlink] = useState('');
  const [youtubelink, setYoutubelink] = useState('');

  const [toggleCheckBox, setToggleCheckBox] = useState(true)
  const [toggleCheckBox2, setToggleCheckBox2] = useState(true)
  const [checkBoxError, setCheckBoxError] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const { login, userToken } = useContext(AuthContext);



  // gov id dropdown
  const [dataGovId, setDataGovId] = useState([{ label: '01', value: '1' }]);
  const [govIdValue, setGovIdValue] = useState(null);
  const [isGovIdFocus, setGovIdIsFocus] = useState(false);
  const [goviddropdownError, setgoviddropdownError] = useState('')

  // address proof dropdown
  const [dataAddressProof, setDataAddressProof] = useState([]);
  const [addressProofvalue, setAddressProofValue] = useState(null);
  const [isAddressProofFocus, setAddressProofIsFocus] = useState(false);
  const [addressProofdropdownError, setaddressProofdropdownError] = useState('')

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
//   const pickDocument = async (forwhat) => {
//     try {
//         const options = {
//             mediaType: 'photo',
//             includeBase64: false,
//             maxHeight: 2000,
//             maxWidth: 2000,
//         };

//         launchImageLibrary(options, (response) => {
//             if (response.didCancel) {
//                 console.log('Document picker was cancelled');
//                 return;
//             }
            
//             if (response.errorMessage) {
//                 console.error('Error picking document', response.errorMessage);
//                 return;
//             }

//             if (response.assets && response.assets.length > 0) {
//                 const pickedDocument = response.assets[0];
                
//                 console.log('URI: ', pickedDocument.uri);
//                 console.log('Type: ', pickedDocument.type);
//                 console.log('Name: ', pickedDocument.fileName);
//                 console.log('Size: ', pickedDocument.fileSize);
                
//                 if (forwhat == 'govid') {
//                     setPickedGovId(pickedDocument);
//                     setPickedGovIdIMG(pickedDocument.uri);
//                     setgovidError('');
//                 } else if (forwhat == 'addressproof') {
//                     setPickedAddressProof(pickedDocument);
//                     setPickedAddressProofIMG(pickedDocument.uri);
//                     setAddressProofError('');
//                 }
//             }
//         });

//     } catch (err) {
//         console.error('Error picking document', err);
//     }
// };

const pickDocument = async (forwhat) => {
  try {
    const result = await DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    });

    console.log('URI: ', result[0].uri);
    console.log('Type: ', result[0].type);
    console.log('Name: ', result[0].name);
    console.log('Size: ', result[0].size);
    if (forwhat == 'govid') {
      setPickedGovId(result[0])
      setPickedGovIdIMG(result[0].uri)
      setgovidError('')
    } else if (forwhat == 'addressproof') {
      setPickedAddressProof(result[0])
      setPickedAddressProofIMG(result[0].uri)
      setAddressProofError('')
    }


  } catch (err) {
    if (DocumentPicker.isCancel(err)) {
      // User cancelled the document picker
      console.log('Document picker was cancelled');
    } else {
      console.error('Error picking document', err);
    }
  }
};
  const deleteGovId = () => {
    setPickedAddressProofIMG(null)
    setPickedAddressProof(null)
  }

  const deleteAddressProof = () => {
    setPickedGovIdIMG(null)
    setPickedGovId(null)
  }

  const fetchGovId = () => {
    axios.get(`${API_URL}/astrologer/government-proof`, {
      headers: {
        "Content-Type": 'application/json',
        "Authorization": 'Bearer ' + route?.params?.token,
      },
    })
      .then(res => {
        let govIdInfo = res.data.data;
        console.log(govIdInfo, 'fetchGovId')
        const transformedData = govIdInfo.map((item, index) => ({
          label: item.govt_proof_name,  // No leading zero
          value: item.id,
        }));
        setDataGovId(transformedData)
        setIsLoading(false);
      })
      .catch(e => {
        console.log(`GovId fetch error ${e}`)
      });
  }

  const fetchAddressProof = () => {
    axios.get(`${API_URL}/astrologer/address-proof`, {
      headers: {
        "Content-Type": 'application/json',
        "Authorization": 'Bearer ' + route?.params?.token,
      },
    })
      .then(res => {
        let addressInfo = res.data.data;
        console.log(addressInfo, 'fetchAddressProof')
        const transformedData = addressInfo.map((item, index) => ({
          label: item.address_proof_name,  // No leading zero
          value: item.id,
        }));
        setDataAddressProof(transformedData)
        setIsLoading(false);
      })
      .catch(e => {
        console.log(`addressInfo fetch error ${e}`)
      });
  }

  useEffect(() => {
    fetchGovId();
    fetchAddressProof()
  }, [])

  const submitForm = async() => {
    const savedLang = await AsyncStorage.getItem('selectedLanguage');
    if (toggleCheckBox && toggleCheckBox2) {
      if (!govIdValue) {
        setgoviddropdownError(t('personalinformation.PleasechooseGovernmentid'))
      } else if (!pickedGovId) {
        setgovidError(t('personalinformation.PleaseuploadGovernmentid'))
      } else if (!addressProofvalue) {
        setaddressProofdropdownError(t('personalinformation.PleasechooseAddressproof'))
      } else if (!pickedAddressProof) {
        setAddressProofError(t('personalinformation.PleaseuploadAddressproof'))
      } else {
        // console.log(yearvalue, 'yearvalue');
        // console.log(selectedItemsLanguage, 'selectedItemsLanguage');
        // console.log(selectedItemsSpecializations, 'selectedItemsSpecializations');
        // console.log(bio, 'bio');
        // console.log(certifications, 'certifications');
        const formData = new FormData();
        formData.append("goverment_id", govIdValue);
        formData.append("address_proof_id", addressProofvalue);
        if (pickedGovId) {
          formData.append("goverment_id_proof_pic", {
            uri: pickedGovId.uri,
            type: pickedGovId.type || 'image/jpeg',
            name: pickedGovId.name || 'photo.jpg',
          });
        } else {
          formData.append("goverment_id_proof_pic", "");
        }
        if (pickedAddressProof) {
          formData.append("address_proof_pic", {
            uri: pickedAddressProof.uri,
            type: pickedAddressProof.type || 'image/jpeg',
            name: pickedAddressProof.name || 'photo.jpg',
          });
        } else {
          formData.append("address_proof_pic", "");
        }
        formData.append("facebook_link", facebooklink);
        formData.append("instragram_link", instagramlink);
        formData.append("linkedin_link", linkedinlink);
        formData.append("youtube_link", youtubelink);

        console.log(JSON.stringify(formData))

        setIsLoading(true)
        axios.post(`${API_URL}/astrologer/registration-third`, formData, {
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
              //login(route?.params?.token)
              navigation.navigate('Thankyou');
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
    } else {
      setCheckBoxError('Please check the necessary permissions.')
    }

  }

  // const submitForm = () =>{
  //   login()
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
              <Text style={styles.header}>{t('personalinformation.govid')}</Text>
              <Text style={styles.requiredheader}> *</Text>
            </View>
            {goviddropdownError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{goviddropdownError}</Text> : <></>}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Dropdown
                style={[styles.dropdownHalf, isGovIdFocus && { borderColor: '#DDD' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.selectedTextStyle}
                data={dataGovId}
                //search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isGovIdFocus ? t('personalinformation.selectgovid') : '...'}
                searchPlaceholder={t('personalinformation.search')}
                value={govIdValue}
                onFocus={() => setGovIdIsFocus(true)}
                onBlur={() => setGovIdIsFocus(false)}
                onChange={item => {
                  setGovIdValue(item.value);
                  setGovIdIsFocus(false);
                  setgoviddropdownError('')
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.uploadgovid')}</Text>
              <Text style={styles.requiredheader}> *</Text>
            </View>
            {govidError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{govidError}</Text> : <></>}
            <View style={{ marginVertical: responsiveHeight(1) }}>
              {!pickedGovIdIMG ?
                <View style={{ height: responsiveHeight(20), width: responsiveWidth(92), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, backgroundColor: '#FAFAFA' }}>
                  <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>
                    <TouchableOpacity onPress={() => pickDocument('govid')}>
                      <Image
                        source={uploadImg}
                        style={{ height: 25, width: 25 }}
                      />
                    </TouchableOpacity>
                    {!pickedGovId ?
                      <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: responsiveFontSize(1.7), color: '#808080', }}>{t('personalinformation.uploadgovid')}</Text>
                      :
                      <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: responsiveFontSize(2), color: '#808080', paddingHorizontal: 5 }}>{pickedGovId.name}</Text>
                    }
                  </View>
                </View>
                :
                <View>
                  <Image source={{ uri: pickedGovIdIMG }} style={{ height: responsiveHeight(20), width: responsiveWidth(92), borderRadius: 10 }} />

                  <View style={{ position: 'absolute', right: 15, top: 7 }}>
                    <TouchableOpacity onPress={() => deleteGovId()}>
                      <Image
                        source={deleteRoundImg}
                        style={{ height: 25, width: 25 }}
                      />
                    </TouchableOpacity>
                  </View>

                </View>
              }
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1) }}>
              <Text style={styles.header}>{t('personalinformation.proofaddress')}</Text>
              <Text style={styles.requiredheader}> *</Text>
            </View>
            {addressProofdropdownError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{addressProofdropdownError}</Text> : <></>}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Dropdown
                style={[styles.dropdownHalf, isAddressProofFocus && { borderColor: '#DDD' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.selectedTextStyle}
                data={dataAddressProof}
                //search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isAddressProofFocus ? t('personalinformation.selectproofadd') : '...'}
                searchPlaceholder={t('personalinformation.search')}
                value={addressProofvalue}
                onFocus={() => setAddressProofIsFocus(true)}
                onBlur={() => setAddressProofIsFocus(false)}
                onChange={item => {
                  setAddressProofValue(item.value);
                  setAddressProofIsFocus(false);
                  setaddressProofdropdownError('')
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.uploadproofadd')}</Text>
              <Text style={styles.requiredheader}> *</Text>
            </View>
            {AddressProofError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{AddressProofError}</Text> : <></>}
            <View style={{ marginVertical: responsiveHeight(1) }}>
              {!pickedAddressProofIMG ?
                <View style={{ height: responsiveHeight(20), width: responsiveWidth(92), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, backgroundColor: '#FAFAFA' }}>
                  <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>
                    <TouchableOpacity onPress={() => pickDocument('addressproof')}>
                      <Image
                        source={uploadImg}
                        style={{ height: 25, width: 25 }}
                      />
                    </TouchableOpacity>
                    {!pickedAddressProof ?
                      <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: responsiveFontSize(1.7), color: '#808080', }}>{t('personalinformation.uploadproofadd')}</Text>
                      :
                      <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: responsiveFontSize(2), color: '#808080', paddingHorizontal: 5 }}>{pickedAddressProof.name}</Text>
                    }
                  </View>
                </View>
                :
                <View>
                  <Image source={{ uri: pickedAddressProofIMG }} style={{ height: responsiveHeight(20), width: responsiveWidth(92), borderRadius: 10 }} />

                  <View style={{ position: 'absolute', right: 15, top: 7 }}>
                    <TouchableOpacity onPress={() => deleteAddressProof()}>
                      <Image
                        source={deleteRoundImg}
                        style={{ height: 25, width: 25 }}
                      />
                    </TouchableOpacity>
                  </View>

                </View>
              }
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(1) }}>
              <Text style={styles.header}>{t('personalinformation.sociallink')}</Text>
            </View>
            <View style={styles.inputView}>
              <InputField
                label={t('personalinformation.fblink')}
                keyboardType=" "
                value={facebooklink}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => setFacebooklink(text)}
              />
            </View>
            <View style={styles.inputView}>
              <InputField
                label={t('personalinformation.instalink')}
                keyboardType=" "
                value={instagramlink}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => setInstagramlink(text)}
              />
            </View>
            <View style={styles.inputView}>
              <InputField
                label={t('personalinformation.linkedinlink')}
                keyboardType=" "
                value={linkedinlink}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => setLinkedinlink(text)}
              />
            </View>
            <View style={styles.inputView}>
              <InputField
                label={t('personalinformation.youtubelink')}
                keyboardType=" "
                value={youtubelink}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                onChangeText={(text) => setYoutubelink(text)}
              />
            </View>
            {checkBoxError ? <Text style={{ color: 'red', fontFamily: 'Outfit-Regular' }}>{checkBoxError}</Text> : <></>}
            <View style={styles.termsView2}>
              <View style={styles.checkboxContainer}>
                <CheckBox
                  disabled={false}
                  value={toggleCheckBox}
                  onValueChange={(newValue) => {
                    setToggleCheckBox(newValue)
                    setCheckBoxError('')
                  }}
                  tintColors={{ true: '#FB7401', false: '#444343' }}
                />
              </View>
              <Text style={styles.termsText}>{t('personalinformation.astrologertext')}</Text>
            </View>
            <View style={styles.termsView}>
              <View style={styles.checkboxContainer}>
                <CheckBox
                  disabled={false}
                  value={toggleCheckBox2}
                  onValueChange={(newValue) => {
                    setToggleCheckBox2(newValue)
                    setCheckBoxError('')
                  }}
                  tintColors={{ true: '#FB7401', false: '#444343' }}
                />
              </View>
              <Text style={styles.termsText}>{t('personalinformation.astrologertext2')}</Text>
            </View>
          </View>

        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', position: 'absolute', bottom: 0, }}>
          <View style={styles.buttonwrapper}>
            <CustomButton label={t('personalinformation.back')}
              onPress={() => { navigation.goBack() }}
              buttonColor="red"
            />
          </View>
          <View style={styles.buttonwrapper}>
            <CustomButton label={t('personalinformation.completeacc')}
              //onPress={() => { navigation.navigate('Thankyou') }}
              onPress={() => { submitForm() }}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

    </SafeAreaView >
  );
};

export default withTranslation()(PersonalInformationThree);

const styles = StyleSheet.create({

  container: {
    //justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  wrapper: {
    paddingHorizontal: 15,
    marginBottom: responsiveHeight(2)
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
  textinputview: {
    marginBottom: responsiveHeight(10),
    marginTop: responsiveHeight(2)
  },
  inputView: {
    paddingVertical: 1
  },
  buttonwrapper: {
    paddingHorizontal: 20,
    width: responsiveWidth(50),
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
    marginBottom: responsiveHeight(3)
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
  dateView: { height: responsiveHeight(6), width: responsiveWidth(88), borderRadius: 10, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: responsiveHeight(2), flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10 },
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
  termsView2: {
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  termsView: {
    paddingRight: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  termsText: {
    color: '#746868',
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: responsiveFontSize(1.5),

  },
  checkboxContainer: {
    ...Platform.select({
      ios: {
          transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }]  // Adjust scale values as needed
      },
      android: {
          transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }]  // Adjust scale values as needed
      }
  })
    // Adjust the scale values to control the size
  },
});
