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
  KeyboardAvoidingView
} from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import DocumentPicker from '@react-native-documents/picker';
import InputField from '../../components/InputField';
import CustomButton from '../../components/CustomButton';
import { dateIcon, deleteRoundImg, pagination1Img, pagination2Img, plus, uploadImg, uploadPicImg, userPhoto } from '../../utils/Images';
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

const PersonalInformationTwo = ({ navigation, route }) => {
  const [currentStep, setCurrentStep] = useState(2)
  const { t, i18n } = useTranslation();
  const [langvalue, setLangValue] = useState('en');

  const [certificatename, setcertificatename] = useState('');
  const [bio, setBio] = useState('');
  const [bioError, setBioError] = useState('')

  const [pickedCarInsuranceIMG, setPickedCarInsuranceIMG] = useState(null);
  const [pickedCarInsurance, setPickedCarInsurance] = useState(null);
  const [CarInsuranceError, setCarInsuranceError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { login, userToken } = useContext(AuthContext);

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

  // experience dropdown
  const [yearvalue, setYearValue] = useState(null);
  const [isYearFocus, setYearIsFocus] = useState(false);
  const [experience, setExperience] = useState([])
  const [experienceError, setExperienceError] = useState('')

  const [certifications, setCertifications] = useState([{ name: '', document: null, documentImg: null }]);

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

  const pickDocument = async (index) => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      });

      console.log('URI: ', result[0].uri);
      console.log('Type: ', result[0].type);
      console.log('Name: ', result[0].name);
      console.log('Size: ', result[0].size);

      const newCertifications = [...certifications];
      newCertifications[index].document = result[0];
      newCertifications[index].documentImg = result[0].uri;
      setCertifications(newCertifications);

    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('Document picker was cancelled');
      } else {
        console.error('Error picking document', err);
      }
    }
  };

  const fetchExperience = async() => {
    console.log(route?.params?.token, 'tokennnnn');
    const savedLang = await AsyncStorage.getItem('selectedLanguage');
    axios.get(`${API_URL}/astrologer/year-of-exprience`, {
      headers: {
        "Content-Type": 'application/json',
        "Authorization": 'Bearer ' + route?.params?.token,
        'Accept-Language':savedLang,
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
  }

  const fetchLanguage = async() => {
    const savedLang = await AsyncStorage.getItem('selectedLanguage');
    axios.get(`${API_URL}/astrologer/language`, {
      headers: {
        "Content-Type": 'application/json',
        "Authorization": 'Bearer ' + route?.params?.token,
        'Accept-Language':savedLang,
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
  }

  const fetchSpecialization = async() => {
    const savedLang = await AsyncStorage.getItem('selectedLanguage');
    axios.get(`${API_URL}/astrologer/specialization`, {
      headers: {
        "Content-Type": 'application/json',
        "Authorization": 'Bearer ' + route?.params?.token,
        'Accept-Language':savedLang,
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
  }


  useEffect(() => {
    fetchExperience();
    fetchLanguage();
    fetchSpecialization();
  }, [])

  const submitForm = async() => {
    const savedLang = await AsyncStorage.getItem('selectedLanguage');
    if (!yearvalue) {
      setExperienceError(t('personalinformation.Pleasechooseexperience'))
    } else if (selectedItemsLanguage && selectedItemsLanguage.length == 0) {
      setSelectedItemLanguageError(t('personalinformation.Pleasechooselanguage'))
    } else if (selectedItemsSpecializations && selectedItemsSpecializations.length == 0) {
      setSelectedItemSpecializationsError(t('personalinformation.Pleasechoosespecializations'))
    } else {
      // console.log(yearvalue, 'yearvalue');
      // console.log(selectedItemsLanguage, 'selectedItemsLanguage');
      // console.log(selectedItemsSpecializations, 'selectedItemsSpecializations');
      // console.log(bio, 'bio');
      // console.log(certifications, 'certifications');
      const formData = new FormData();
      formData.append("year_of_experience", yearvalue);
      formData.append("languages", selectedItemsLanguage);
      formData.append("specializations", selectedItemsSpecializations);
      formData.append("short_bio", bio);
      certifications.forEach((certificate, index) => {
        formData.append(`certificate[${index}][certification_name]`, certificate.name);
        formData.append(`certificate[${index}][certification_pic]`, {
          uri: certificate.document.uri,
          type: certificate.document.type || 'image/jpeg',
          name: certificate.document.name || `certification_${index}.jpg`,
        });
      });
      console.log(JSON.stringify(formData))
      console.log(route?.params?.token);
      setIsLoading(true)
      axios.post(`${API_URL}/astrologer/registration-second`, formData, {
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
            navigation.navigate('PersonalInformationThree', { token: route?.params?.token })
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

  const deleteDocument = (index) => {
    const newCertifications = [...certifications];
    newCertifications[index].document = null; // Reset the document and image
    newCertifications[index].documentImg = null;
    setCertifications(newCertifications);
  };

  if (isLoading) {
    return (
      <Loader />
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAwareScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: responsiveHeight(2) }}>
        <View style={{ paddingHorizontal: 20, paddingVertical: 25 }}>
          <MaterialIcons name="arrow-back" size={25} color="#000" onPress={() => navigation.goBack()} />
        </View>
        <View style={styles.wrapper}>
          <Text style={styles.header1}>{t('personalinformation.header')}</Text>
          <Text style={styles.subheader}>{t('personalinformation.subheader')}</Text>
          <StepIndicator currentStep={currentStep} />
          <View style={styles.textinputview}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.header}>{t('personalinformation.yearexp')}</Text>
              <Text style={styles.requiredheader}>*</Text>
            </View>
            {experienceError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{experienceError}</Text> : <></>}
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
              <View style={{ paddingHorizontal: 5, borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 8, width: responsiveWidth(92) }}>
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
                  displayKey="name"
                  searchInputStyle={styles.searchInput}
                  styleDropdownMenu={styles.dropdownMenu}
                  styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
                  styleMainWrapper={styles.mainWrapper}
                  submitButtonColor="#E3A15D"
                  submitButtonText="Submit"
                  styleIndicator={{ marginTop: -4, marginRight: - responsiveWidth(6) }}
                  hideSubmitButton
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
              <View style={{ paddingHorizontal: 5, borderColor: '#E0E0E0', borderWidth: 1, borderRadius: 8, width: responsiveWidth(92) }}>
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
                  displayKey="name"
                  searchInputStyle={styles.searchInput}
                  styleDropdownMenu={styles.dropdownMenu}
                  styleDropdownMenuSubsection={styles.dropdownMenuSubsection}
                  styleMainWrapper={styles.mainWrapper}
                  submitButtonColor="#E3A15D"
                  submitButtonText="Submit"
                  styleIndicator={{ marginTop: -4, marginRight: - responsiveWidth(6) }}
                  hideSubmitButton
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
            {/* {bioError ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{bioError}</Text> : <></>} */}
            <View style={styles.inputView}>
              <InputField
                label={t('personalinformation.writebio')}
                keyboardType=" "
                value={bio}
                //helperText={firstNameError}
                inputType={'address'}
                onChangeText={(text) => setBio(text)}
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
                    onChangeText={(text) => updateCertificationName(text, index)}
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
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', position: 'absolute', bottom: 0 }}>
          <View style={styles.buttonwrapper}>
            <CustomButton label={t('personalinformation.back')}
              onPress={() => { navigation.goBack() }}
              buttonColor="red"
            />
          </View>
          <View style={styles.buttonwrapper}>
            <CustomButton label={t('personalinformation.savenext')}
              //onPress={() => { navigation.navigate('Thankyou') }}
              onPress={() => { submitForm() }}
            />
          </View>
        </View>
      </KeyboardAwareScrollView>

    </SafeAreaView >
  );
};

export default withTranslation()(PersonalInformationTwo);

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
  addnew: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: responsiveFontSize(1.5),
    color: '#FB7401',
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
});
