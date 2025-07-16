import React, { useCallback } from 'react'
import { SafeAreaView, View, Text, TouchableOpacity, Image, BackHandler } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Thankyou from '../..//assets/images/misc/Thankyou.svg';
import Logo from '../..//assets/images/misc/logo.svg'
import LinearGradient from 'react-native-linear-gradient';
import CustomButton from '../../components/CustomButton';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { acceptImg } from '../../utils/Images';
import { withTranslation, useTranslation } from 'react-i18next';

const ThankYouScreen = ({  }) => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Onboarding'); // Replace 'YourTargetScreen' with the name of the screen you want to navigate to
        return true; // This prevents the default behavior (going back to the previous screen)
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );
  return (

    <LinearGradient
      colors={['#EFDFC9', '#FEF7EF', '#FFF']} // Change these colors as needed
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{
        flex: 1, justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View style={{ marginTop: 1, backgroundColor: '#F4F5F5', width: responsiveWidth(90), height: responsiveHeight(6), paddingHorizontal: 10, borderRadius: 10, flexDirection: 'row', alignItems: 'center' }}>
          <Image
            source={acceptImg}
            style={{ height: 15, width: 15, resizeMode: 'contain' }}
          />
          <Text style={{ color: '#2D2D2D', alignSelf: 'center', fontFamily: 'PlusJakartaSans-Medium', fontSize: responsiveFontSize(1.5), marginLeft: 10 }}>{t('thankyou.RegistrationSuccessfullyDone')}</Text>
        </View>
        <View style={{ flex: 0.7, justifyContent: 'center', alignItems: 'center' }}>
          <Logo
            width={300}
            height={200}
          //style={{transform: [{rotate: '-15deg'}]}}
          />
        </View>
        <View style={{ paddingHorizontal: 20, marginBottom: responsiveHeight(2) }}>
          <Text style={{ color: '#444343', alignSelf: 'center', fontFamily: 'PlusJakartaSans-Bold', fontSize: responsiveFontSize(2.5), textAlign: 'center', marginBottom: 10 }}>{t('thankyou.ThankYou')}</Text>
          <Text style={{ color: '#746868', alignSelf: 'center', fontFamily: 'PlusJakartaSans-Regular', fontSize: responsiveFontSize(1.5), textAlign: 'center' }}>{t('thankyou.desc')}</Text>
        </View>
        <View style={{width: responsiveWidth(92)}}>
          <CustomButton
            label={'Login'}
            onPress={() => { navigation.navigate('Onboarding') }}
          />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default withTranslation()(ThankYouScreen);
