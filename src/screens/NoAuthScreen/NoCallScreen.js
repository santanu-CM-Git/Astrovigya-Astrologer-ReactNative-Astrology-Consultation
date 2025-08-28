import React from 'react'
import { View, Text, StyleSheet, ScrollView, ImageBackground, Image } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { nocallImg, nochatImg, notificationImg, notifyImg } from '../../utils/Images'
import { withTranslation, useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView } from 'react-native-safe-area-context'
const NoCallScreen = ({  }) => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    return (
        <SafeAreaView style={styles.Container}>
            <ScrollView style={styles.wrapper}>
                <View style={{justifyContent:'center',alignItems:'center',marginTop: responsiveHeight(15)}}>
                    <Image source={nocallImg} style={styles.iconImage}/>
                    <Text style={{color:'#3A3232',fontFamily:'PlusJakartaSans-Medium',fontSize: responsiveFontSize(2),marginVertical: responsiveHeight(2)}}>{t('Nocallscreen.NoClientsyet')}</Text>
                    <Text style={{color:'#949494',fontFamily:'PlusJakartaSans-Medium',fontSize: responsiveFontSize(1.7),textAlign:'center'}}>{t('Nocallscreen.desc')}</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}


export default withTranslation()(NoCallScreen)


const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    wrapper: {
        padding: 20,
        marginBottom: responsiveHeight(1),
        flex: 3,
    },
    iconImage: {
        height: responsiveHeight(30),
        width: responsiveWidth(30),
        resizeMode: 'contain'
    }

});