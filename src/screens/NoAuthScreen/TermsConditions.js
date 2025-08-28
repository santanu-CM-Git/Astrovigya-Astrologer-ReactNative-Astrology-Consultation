import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import CustomHeader from '../../components/CustomHeader';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context'
export default function TermsConditions({  }) {
    const navigation = useNavigation();
    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Privacy Policy'} title={'Terms & Conditions'} onPress={() => navigation.goBack()} onPressProfile={() => navigation.navigate('Profile')} />
            <WebView
                source={{ uri: 'https://astrovigya.com/terms-conditions/' }}
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
});