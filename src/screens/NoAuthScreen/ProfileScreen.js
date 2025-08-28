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
  KeyboardAvoidingView,
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import DocumentPicker from 'react-native-document-picker';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { deleteRoundImg, plus, uploadImg, uploadPicImg, userPhoto, dateIcon } from '../../utils/Images';
import { AuthContext } from '../../context/AuthContext';
import Loader from '../../utils/Loader';
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';
import { API_URL } from '@env'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CustomHeader from '../../components/CustomHeader';
import MultiSelect from 'react-native-multiple-select';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Entypo';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { withTranslation, useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context'

const dataGender = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Others', value: 'Others' }
];
const dataAddressProof = [
  { label: 'Male', value: 'Male' },
  { label: 'Female', value: 'Female' },
  { label: 'Others', value: 'Others' }
];
const dataGovId = [
  { label: '01', value: '1' },
  { label: '02', value: '2' },
  { label: '03', value: '3' },
  { label: '04', value: '4' },
  { label: '05', value: '5' },
  { label: '06', value: '6' },
  { label: '07', value: '7' },
  { label: '08', value: '8' },
  { label: '09', value: '9' },
  { label: '10', value: '10' },
];

const ProfileScreen = ({  route }) => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(1)
  const { t, i18n } = useTranslation();
  const [langvalue, setLangValue] = useState('en');

  const [firstname, setFirstname] = useState('');
  const [firstNameError, setFirstNameError] = useState('')
  const [displayname, setDisplayname] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('')
  const [phoneno, setPhoneno] = useState('');
  const [phonenoError, setPhonenoError] = useState('')

  const MIN_DATE = new Date(1930, 0, 1)
  const MAX_DATE = new Date()
  const [date, setDate] = useState('DD - MM  - YYYY')
  const [selectedDOB, setSelectedDOB] = useState(MAX_DATE)
  const [open, setOpen] = useState(false)
  const [dobError, setdobError] = useState('')
  const [dob, setdob] = useState('');

  const [pickedDocument, setPickedDocument] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isPicUploadLoading, setIsPicUploadLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true)
  const { login, userToken } = useContext(AuthContext);

  const [gendervalue, setGenderValue] = useState(null);
  const [isGenderFocus, setGenderIsFocus] = useState(false);

  const [bio, setBio] = useState('');
  const [bioError, setBioError] = useState('')

  const [govIdValue, setGovIdValue] = useState(null);
  const [isGovIdFocus, setGovIdIsFocus] = useState(false);

  const [pickedGovId, setPickedGovId] = useState(null);
  const [pickedGovIdIMG, setPickedGovIdIMG] = useState(null);
  const [govidError, setgovidError] = useState('')

  const [addressProofvalue, setAddressProofValue] = useState(null);
  const [isAddressProofFocus, setAddressProofIsFocus] = useState(false);

  const [pickedAddressProof, setPickedAddressProof] = useState(null);
  const [pickedAddressProofIMG, setPickedAddressProofIMG] = useState(null);
  const [AddressProofError, setAddressProofError] = useState('')

  const [facebooklink, setFacebooklink] = useState('');
  const [instagramlink, setInstagramlink] = useState('');
  const [linkedinlink, setLinkedinlink] = useState('');
  const [youtubelink, setYoutubelink] = useState('');

  const [isEditable, setIsEditable] = useState(false);

  // experience dropdown
  const [yearvalue, setYearValue] = useState("");
  const [isYearFocus, setYearIsFocus] = useState(false);
  const [experience, setExperience] = useState([])
  const [experienceError, setExperienceError] = useState('')

  // Language dropdown
  const [itemsLanguage, setitemsLanguage] = useState([])
  const [selectedItemsLanguage, setSelectedItemsLanguage] = useState([]);
  const [selectedItemLanguageError, setSelectedItemLanguageError] = useState('')
  const multiSelectRefLanguage = useRef(null);
  const onSelectedItemsChangeLanguage = selectedItems => {
    setSelectedItemsLanguage(selectedItems);
    setSelectedItemLanguageError('')
  };

  // Specializations dropdown
  const [itemsSpecializations, setitemsSpecializations] = useState([])
  const [selectedItemsSpecializations, setSelectedItemsSpecializations] = useState([]);
  const [selectedItemSpecializationsError, setSelectedItemSpecializationsError] = useState('')
  const multiSelectRefSpecializations = useRef(null);
  const onSelectedItemsChangeSpecializations = selectedItems => {
    setSelectedItemsSpecializations(selectedItems);
    setSelectedItemSpecializationsError('')
  };

  const [certifications, setCertifications] = useState([{ name: '', document: null, documentImg: null }]);

  const addCertification = () => {
    setCertifications([...certifications, { name: '', document: null, documentImg: null }]);
  };

  const removeCertification = (index) => {
    const newCertifications = [...certifications];
    newCertifications.splice(index, 1);
    setCertifications(newCertifications);
  };

  const updateCertificationName = (text, index) => {
    const newCertifications = [...certifications];
    newCertifications[index].name = text;
    setCertifications(newCertifications);
  };

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
      setEmailError('Please enter correct Email Id')
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
      setPhonenoError('Please enter a 10-digit number.')
      return false;
    } else {
      setPhonenoError('')
      setPhoneno(text)
    }
  }

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      const pickedDocument = result[0];
      setPickedDocument(pickedDocument);

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

    } catch (err) {
      setIsPicUploadLoading(false);
      if (DocumentPicker.isCancel(err)) {
        console.log('Document picker was cancelled');
      } else if (err.response) {
        console.log('Error response:', err.response.data?.response?.records);
        handleAlert('Oops..', err.response.data?.message);
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


  useEffect(() => {
    fetchExperience()
    fetchUserData();
  }, [])

  const fetchExperience = () => {
    AsyncStorage.getItem('userToken', async(err, usertoken) => {
      const savedLang = await AsyncStorage.getItem('selectedLanguage');
      axios.get(`${API_URL}/astrologer/year-of-exprience`, {
        headers: {
          "Content-Type": 'application/json',
          "Authorization": 'Bearer ' + usertoken,
          'Accept-Language': savedLang,
        },
      })
        .then(res => {
          let experienceInfo = res.data.data;
          console.log(experienceInfo, 'fetchExperience')

          const transformedData = experienceInfo.map((item, index) => ({
            label: item.expriences_years,  // No leading zero
            value: item.id,
          }));
          setExperience(transformedData)
          // setitemsSpecializations(languageInfo)
          setIsLoading(false);
        })
        .catch(e => {
          console.log(`exprience fetch error ${e}`)
        });
    });
  }

  const fetchLanguage = () => {
    AsyncStorage.getItem('userToken', async(err, usertoken) => {
      const savedLang = await AsyncStorage.getItem('selectedLanguage');
      axios.get(`${API_URL}/astrologer/language`, {
        headers: {
          "Content-Type": 'application/json',
          "Authorization": 'Bearer ' + usertoken,
          'Accept-Language': savedLang,
        },
      })
        .then(res => {
          let languageInfo = res.data.data;
          console.log(languageInfo, 'fetchLanguage')
          setitemsLanguage(languageInfo)
          setIsLoading(false);
        })
        .catch(e => {
          console.log(`Language fetch error ${e}`)
        });
    });
  }

  const fetchSpecialization = () => {
    AsyncStorage.getItem('userToken', async(err, usertoken) => {
      const savedLang = await AsyncStorage.getItem('selectedLanguage');
      axios.get(`${API_URL}/astrologer/specialization`, {
        headers: {
          "Content-Type": 'application/json',
          "Authorization": 'Bearer ' + route?.params?.token,
          'Accept-Language': savedLang,
        },
      })
        .then(res => {
          let specializationInfo = res.data.data;
          console.log(specializationInfo, 'fetchSpecialization')
          setitemsSpecializations(specializationInfo)
          setIsLoading(false);
        })
        .catch(e => {
          console.log(`specialization fetch error ${e}`)
        });
    });
  }

  const fetchUserData = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const savedLang = await AsyncStorage.getItem('selectedLanguage');
      if (!userToken) {
        console.log('No user token found');
        setIsLoading(false);
        return;
      }

      console.log(userToken, 'usertoken');

      const response = await axios.post(`${API_URL}/astrologer/profile`, {}, {
        headers: {
          "Authorization": `Bearer ${userToken}`,
          "Content-Type": 'application/json',
          'Accept-Language': savedLang,
        }
      });

      const userInfo = response.data.data;
      console.log(userInfo, 'user data from profile api ');


      setImageFile(userInfo?.profile_pic || '')
      setFirstname(userInfo?.full_name || '');
      setDisplayname(userInfo?.display_name || '')
      setEmail(userInfo?.email || '');
      setPhoneno(userInfo?.mobile || '');
      setdob(userInfo?.dob || '');
      setGenderValue(userInfo?.gender || '');
      setYearValue(userInfo?.year_of_experience || '')


      const certificationsData = userInfo?.astrologer_certification?.map(cert => ({
        name: cert.certification_name || '',
        document: cert.certification_pic || null,
        documentImg: cert.certification_pic || null
      })) || [];
      setCertifications(certificationsData);
      setBio(userInfo?.short_bio || '')
      setPickedGovIdIMG(userInfo?.goverment_id_proof_pic || '')
      setPickedAddressProofIMG(userInfo?.address_proof_pic || '')
      setFacebooklink(userInfo?.facebook_link || '')
      setInstagramlink(userInfo?.instragram_link || '')
      setLinkedinlink(userInfo?.linkedin_link || '')
      setYoutubelink(userInfo?.youtube_link || '')


      // const languageId = userInfo?.astrologer_language.map(item => item.therapy_type_id) || [];
      // setSelectedItemsLanguage(languageId);

      setIsLoading(false);

    } catch (error) {
      console.log(`Profile error: ${error}`);
      setIsLoading(false);
    }
  };


  const submitForm = () => {
    navigation.navigate('PersonalInformationTwo')
  }

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader commingFrom={'Profile'} onPress={() => navigation.goBack()} title={t('Profile.Profile')} />
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(4) }}>
        <View style={styles.wrapper}>
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
                <TouchableOpacity style={styles.plusIcon} 
                //onPress={pickDocument}
                >
                  <Image source={plus} style={styles.iconStyle} />
                </TouchableOpacity>
              </View>
              <View style={{ flexDirection: 'column', marginLeft: responsiveWidth(3) }}>
                <Text style={styles.header}>{t('personalinformation.uploadphoto')}</Text>
                <Text style={styles.subheader}>{t('personalinformation.uploadphoto2')}</Text>
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
                //onChangeText={(text) => changeFirstname(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.displayname')}</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {firstNameError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{firstNameError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={t('personalinformation.enterdisplayname')}
                keyboardType=" "
                value={displayname}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                //onChangeText={(text) => setDisplayname(text)}
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
                inputType={'others'}
                //onChangeText={(text) => changeEmail(text)}
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
                inputType={'others'}
                //onChangeText={(text) => changePhone(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.dob')}</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {dobError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{dobError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={'Date of Birth'}
                keyboardType=" "
                value={dob}
                //helperText={'Please enter lastname'}
                inputType={'nonedit'}
              //onChangeText={(text) => changePassword(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.gender')}</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
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
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.yearexp')}</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Dropdown
                style={[styles.dropdownHalf, isYearFocus && { borderColor: '#DDD' }]}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedTextStyle}
                inputSearchStyle={styles.inputSearchStyle}
                itemTextStyle={styles.selectedTextStyle}
                data={experience}
                //search
                maxHeight={300}
                labelField="label"
                valueField="value"
                placeholder={!isYearFocus ? t('personalinformation.selectyear') : '...'}
                searchPlaceholder="Search..."
                value={yearvalue}
                onFocus={() => setYearIsFocus(true)}
                onBlur={() => setYearIsFocus(false)}
                onChange={item => {
                  setYearValue(item.value);
                  setYearIsFocus(false);
                  setExperienceError('')
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.lang')}</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {selectedItemLanguageError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{selectedItemLanguageError}</Text> : <></>}
            <View style={{ flex: 1, marginVertical: responsiveHeight(1) }}>
              <View style={styles.multiselectDropdownView}>
                <MultiSelect
                  hideTags
                  items={itemsLanguage}
                  uniqueKey="id"
                  ref={multiSelectRefLanguage}
                  onSelectedItemsChange={onSelectedItemsChangeLanguage}
                  selectedItems={selectedItemsLanguage}
                  selectText={t('personalinformation.picklang')}
                  searchInputPlaceholderText={t('personalinformation.searchlang')}
                  onChangeInput={(text) => console.log(text)}
                  altFontFamily="PlusJakartaSans-Regular"
                  tagRemoveIconColor="#000000"
                  tagBorderColor="#E3A15D"
                  tagTextColor="#2D2D2D"
                  selectedItemTextColor="#000"
                  selectedItemIconColor="#000"
                  itemTextColor="#746868"
                  displayKey="content"
                  searchInputStyle={styles.searchInput}
                  styleDropdownMenu={styles.dropdownMenu}
                  styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
                  styleMainWrapper={styles.mainWrapper}
                  submitButtonColor="#E3A15D"
                  submitButtonText="Submit"
                  styleIndicator={{ marginTop: -4, marginRight: - responsiveWidth(6) }}
                  hideSubmitButton
                  disabled={!isEditable}
                />
              </View>
              <View style={{ marginVertical: responsiveHeight(2) }}>
                {multiSelectRefLanguage.current && multiSelectRefLanguage.current.getSelectedItemsExt(selectedItemsLanguage)}
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.areaspecialization')}</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {selectedItemSpecializationsError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{selectedItemSpecializationsError}</Text> : <></>}
            <View style={{ flex: 1, marginVertical: responsiveHeight(1) }}>
              <View style={styles.multiselectDropdownView}>
                <MultiSelect
                  hideTags
                  items={itemsSpecializations}
                  uniqueKey="id"
                  ref={multiSelectRefSpecializations}
                  onSelectedItemsChange={onSelectedItemsChangeSpecializations}
                  selectedItems={selectedItemsSpecializations}
                  selectText={t('personalinformation.pickspec')}
                  searchInputPlaceholderText={t('personalinformation.searchspec')}
                  onChangeInput={(text) => console.log(text)}
                  altFontFamily="PlusJakartaSans-Regular"
                  tagRemoveIconColor="#000000"
                  tagBorderColor="#E3A15D"
                  tagTextColor="#2D2D2D"
                  selectedItemTextColor="#000"
                  selectedItemIconColor="#000"
                  itemTextColor="#746868"
                  displayKey="content"
                  searchInputStyle={styles.searchInput}
                  styleDropdownMenu={styles.dropdownMenu}
                  styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
                  styleMainWrapper={styles.mainWrapper}
                  submitButtonColor="#E3A15D"
                  submitButtonText="Submit"
                  styleIndicator={{ marginTop: -4, marginRight: - responsiveWidth(6) }}
                  hideSubmitButton
                  disabled={!isEditable}
                />
              </View>
              <View style={{ marginVertical: responsiveHeight(2) }}>
                {multiSelectRefSpecializations.current && multiSelectRefSpecializations.current.getSelectedItemsExt(selectedItemsSpecializations)}
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.shortbio')}</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {bioError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{bioError}</Text> : <></>}
            <View style={styles.inputView}>
              <InputField
                label={t('personalinformation.writebio')}
                keyboardType=" "
                value={bio}
                //helperText={firstNameError}
                inputType={'address'}
                //onChangeText={(text) => setBio(text)}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.certifications')}</Text>
              <TouchableOpacity onPress={addCertification}>
                <Text style={styles.addnew}>{t('personalinformation.addnew')}</Text>
              </TouchableOpacity>
            </View>
            {certifications.map((certification, index) => (
              <View key={index} style={{ flex: 1 }}>
                {index > 0 && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: responsiveHeight(2) }}>
                    <Text style={styles.header}>{t('personalinformation.certifications')}</Text>
                    <TouchableOpacity onPress={() => removeCertification(index)}>
                      <Text style={styles.addnew}>{t('personalinformation.remove')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <View style={styles.inputView}>
                  <InputField
                    label={t('personalinformation.writecertificate')}
                    keyboardType=" "
                    value={certification.name}
                    //helperText={'Please enter lastname'}
                    inputType={'others'}
                    //onChangeText={(text) => updateCertificationName(text, index)}
                  />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.header}>{t('personalinformation.uploadcertificate')}</Text>
                </View>
                <View style={{ marginTop: 7 }}>
                  {!certification.document ?
                    <View style={{ height: responsiveHeight(20), width: responsiveWidth(92), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, backgroundColor: '#fff' }}>
                      <TouchableOpacity onPress={() => pickDocument(index)}>
                        <View style={{ flexDirection: 'column', alignItems: 'center', marginVertical: 40 }}>
                          <Image
                            source={uploadImg}
                            style={{ height: 25, width: 25 }}
                          />
                          <Text style={{ fontFamily: 'PlusJakartaSans-Medium', fontSize: responsiveFontSize(1.7), color: '#808080', }}>{certification.document ? certification.document.name : t('personalinformation.uploadcertificate')}</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                    :
                    <View>
                      <Image source={{ uri: certification.documentImg }} style={{ height: responsiveHeight(20), width: responsiveWidth(92), borderRadius: 10 }} />
                      <View style={{ position: 'absolute', right: 15, top: 7 }}>
                        <TouchableOpacity onPress={() => deleteDocument(index)}>
                          <Image source={deleteRoundImg} style={{ height: 25, width: 25 }} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  }
                </View>
              </View>
            ))}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: responsiveHeight(2) }}>
              <Text style={styles.header}>{t('personalinformation.govid')}</Text>
              <Text style={styles.requiredheader}> *</Text>
            </View>
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
                  <Image source={{ uri: pickedGovIdIMG }} style={{ height: responsiveHeight(20), width: responsiveWidth(88), borderRadius: 10 }} />

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
                  <Image source={{ uri: pickedAddressProofIMG }} style={{ height: responsiveHeight(20), width: responsiveWidth(88), borderRadius: 10 }} />

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
                // onChangeText={(text) => setFacebooklink(text)}
              />
            </View>
            <View style={styles.inputView}>
              <InputField
                label={t('personalinformation.instalink')}
                keyboardType=" "
                value={instagramlink}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                // onChangeText={(text) => setInstagramlink(text)}
              />
            </View>
            <View style={styles.inputView}>
              <InputField
                label={t('personalinformation.linkedinlink')}
                keyboardType=" "
                value={linkedinlink}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                // onChangeText={(text) => setLinkedinlink(text)}
              />
            </View>
            <View style={styles.inputView}>
              <InputField
                label={t('personalinformation.youtubelink')}
                keyboardType=" "
                value={youtubelink}
                //helperText={'Please enter lastname'}
                inputType={'others'}
                // onChangeText={(text) => setYoutubelink(text)}
              />
            </View>
          </View>
        </View>
        <View style={styles.buttonwrapper}>
          {/* <CustomButton label={"Submit"}
            // onPress={() => { login() }}
            onPress={() => { submitForm() }}
          /> */}
          <Text style={{ fontFamily: 'PlusJakartaSans-SemiBold', fontSize: responsiveFontSize(2), color: '#808080', }}>
            *{t('Profile.msg')}
          </Text>
        </View>
      </KeyboardAwareScrollView>

    </SafeAreaView >
  );
};

export default withTranslation()(ProfileScreen);

const styles = StyleSheet.create({

  container: {
    //justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    flex: 1
  },
  wrapper: {
    paddingHorizontal: 15,
    //height: responsiveHeight(78)
  },
  buttonwrapper: {
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 0,
    width: responsiveWidth(100),
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
    marginTop: responsiveHeight(2),
  },
  inputView: {
    paddingVertical: 1,
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
  multiselectDropdownView: { paddingHorizontal: 5, borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 8, width: responsiveWidth(92) },
  certificationView: { height: responsiveHeight(20), width: responsiveWidth(92), borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 10, backgroundColor: '#fff' }
});
