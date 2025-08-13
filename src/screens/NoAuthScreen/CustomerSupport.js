import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import CustomHeader from '../../components/CustomHeader';
import { useNavigation } from '@react-navigation/native';

export default function CustomerSupport({ }) {
    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.Container}>
        <CustomHeader commingFrom={'Privacy Policy'} title={'About Us'} onPress={() => navigation.goBack()} onPressProfile={() => navigation.navigate('Profile')} />
        <WebView
            source={{ uri: 'https://astrovigya.com/about-us/' }}
            style={{ flex: 1 }}
            startInLoadingState={true}
        />
    </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    wrapper: {
        padding: 20,
        //paddingBottom: responsiveHeight(2)
    },
    

});