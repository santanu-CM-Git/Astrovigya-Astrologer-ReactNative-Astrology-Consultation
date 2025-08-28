import React, { useContext, useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Logo from '../../assets/images/misc/logo.svg';
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../components/CustomButton';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { withTranslation, useTranslation } from 'react-i18next';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context'
const language = [
  { label: 'English', value: 'en' },
  { label: 'हिंदी', value: 'hi' }
];

const OnboardingScreen = ({  }) => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const [langvalue, setLangValue] = useState('en');
  const [isLangFocus, setLangIsFocus] = useState(false);

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
  const handleLangChange = async (item) => {
    try {
      await AsyncStorage.setItem('selectedLanguage', item.value);
      console.log(item.value);
      i18n.changeLanguage(item.value);
      setLangValue(item.value);
      setLangIsFocus(false);
    } catch (error) {
      console.error('Failed to save language to AsyncStorage', error);
    }
  };
  return (
    <LinearGradient
      colors={['#FFF9F1', '#FFF9F1', '#FFF9F1']} // Change these colors as needed
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../assets/images/onboard.png')}
            style={styles.image}
          />
          <Dropdown
            style={[styles.dropdownHalf, isLangFocus && { borderColor: '#DDD' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            itemTextStyle={styles.selectedTextStyle}
            iconStyle={styles.iconStyle}
            data={language}
            maxHeight={300}
            labelField="label"
            valueField="value" 
            placeholder={!isLangFocus ? 'Select' : '...'}
            value={langvalue}
            onFocus={() => setLangIsFocus(true)}
            onBlur={() => setLangIsFocus(false)}
            onChange={handleLangChange}
          />
          <LinearGradient
            colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 1)']}
            locations={[0.6, 0.8, 1]} // Adjust these values to control the transparency effect
            style={styles.gradient}
          />
        </View>
        <View style={styles.overlay}>
          <View style={styles.iconContainer}>
            <Image
              source={require('../../assets/images/icon.png')}
              style={styles.icon}
            />
          </View>
          <Text style={styles.welcomeText}>{t('onboard.text')}</Text>
          <Text style={styles.description}>
            {t('onboard.desc')}
          </Text>
          <View style={styles.buttonContainer}>
            <CustomButton
              label={t('buttons.signIn')}
              onPress={() => navigation.navigate('Login')}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
    height: responsiveHeight(60),
    width: responsiveWidth(100),
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    height: '50%', // Adjust this value as needed
    width: '100%',
  },
  overlay: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: responsiveWidth(5),
  },
  iconContainer: {
    marginTop: responsiveHeight(2),
    marginBottom: Platform.OS === 'android' ? responsiveHeight(5) : responsiveHeight(0),
  },
  icon: {
    height: responsiveHeight(7),
    width: responsiveWidth(80),
    resizeMode: 'contain',
  },
  welcomeText: {
    fontSize: responsiveFontSize(2),
    color: '#1E2023',
    textAlign: 'center',
    marginBottom: '5%', // 5% margin at the bottom,
    fontFamily: 'PlusJakartaSans-Bold'
  },
  description: {
    fontSize: responsiveFontSize(1.7),
    color: '#8B939D',
    textAlign: 'center',
    marginBottom: '10%', // 10% margin at the bottom,
    fontFamily: 'PlusJakartaSans-Regular'
  },
  buttonContainer: {
    width: responsiveWidth(90),
  },
  dropdownHalf: {
    //height: responsiveHeight(4),
    width: responsiveWidth(26),
    borderColor: '#E3A15D',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 8,
    position: 'absolute',
    right: 5,
    top: 40,
    justifyContent: 'center',
    alignItems: 'center',
    //paddingBottom: 5
  },
  placeholderStyle: {
    fontSize: responsiveFontSize(1.6),
    color: '#2F2F2F',
    fontFamily: 'PlusJakartaSans-Regular'
  },
  selectedTextStyle: {
    fontSize: responsiveFontSize(1.8),
    color: '#2F2F2F',
    fontFamily: 'PlusJakartaSans-Bold'
  },
  inputSearchStyle: {
    fontSize: responsiveFontSize(1.8),
    color: '#2F2F2F',
    fontFamily: 'PlusJakartaSans-Bold'
  },
  iconStyle: {
    tintColor: '#FB7401',
    marginTop: 5
  }
});

export default withTranslation()(OnboardingScreen);