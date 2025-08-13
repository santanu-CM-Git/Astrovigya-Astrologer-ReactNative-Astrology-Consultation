import React, { useContext, useState,useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import CustomHeader from '../../components/CustomHeader';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { languageMenu, privacyMenu, termsMenu, logoutMenu, ArrowGratter, aboutusMenu } from '../../utils/Images';
import Modal from "react-native-modal";
import Icon from 'react-native-vector-icons/Entypo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomButton from '../../components/CustomButton';
import { AuthContext } from '../../context/AuthContext';
import { withTranslation, useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = ({  }) => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const { logout } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
    const [isAccountDeleteModalVisible, setAccountDeleteModalVisible] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('English');
    const [langvalue, setLangValue] = useState('en');

    useEffect(() => {
        // Load language from AsyncStorage when the component mounts
        const loadLanguage = async () => {
            try {
                const savedLang = await AsyncStorage.getItem('selectedLanguage');
                if (savedLang) {
                    console.log(savedLang);

                    setLangValue(savedLang);
                    i18n.changeLanguage(savedLang);
                }
            } catch (error) {
                console.error('Failed to load language from AsyncStorage', error);
            }
        };

        loadLanguage();
    }, []);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };
    const toggleLogoutModal = () => {
        setLogoutModalVisible(!isLogoutModalVisible);
    };
    const toggleAccountDeleteModal = () => {
        setAccountDeleteModalVisible(!isAccountDeleteModalVisible);
    };
    const selectLanguage = (language) => {
        setSelectedLanguage(language);
        setLangValue(language)
        toggleModal();
        AsyncStorage.setItem('selectedLanguage', language);
        navigation.navigate("Home")
    };

    const deleteAccount = () => {

    }

    if (isLoading) {
        return (
            <Loader />
        );
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'Settings'} onPress={() => navigation.goBack()} title={t('settings.settings')} />
            <ScrollView style={styles.wrapper}>
                <View style={styles.flexView}>
                    <View style={[styles.iconNameView, { width: responsiveWidth(73) }]}>
                        <Image
                            source={languageMenu}
                            style={[styles.cardIconImg, { marginRight: responsiveWidth(3) }]}
                        />
                        <Text style={styles.textStyle}>{t('settings.SelectLanguage')}</Text>
                    </View>
                    <TouchableOpacity onPress={toggleModal} style={[styles.iconNameView, { width: responsiveWidth(25) }]}>
                    <Text style={styles.textStyle}>{langvalue == 'en' ? "English" : "Hindi"}</Text>
                        <Image
                            source={ArrowGratter}
                            style={[styles.IconImg, { marginLeft: responsiveWidth(3), tintColor: '#8B939D' }]}
                        />
                    </TouchableOpacity>
                </View>
                <View style={[styles.horizontalLine, { borderColor: '#E3E3E3' }]} />
                {/* <TouchableOpacity onPress={() => navigation.navigate('HOME', { screen: 'PrivacyPolicy', key: Math.random().toString() })}> */}
                <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
                    <View style={styles.flexView}>
                        <View style={[styles.iconNameView, { width: responsiveWidth(73) }]}>
                            <Image
                                source={privacyMenu}
                                style={[styles.cardIconImg, { marginRight: responsiveWidth(3) }]}
                            />
                            <Text style={styles.textStyle}>{t('settings.PrivacyPolicy')}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={[styles.horizontalLine, { borderColor: '#E3E3E3' }]} />
                {/* <TouchableOpacity onPress={() => navigation.navigate('HOME', { screen: 'CustomerSupport', key: Math.random().toString() })}> */}
                <TouchableOpacity onPress={() => navigation.navigate('CustomerSupport')}>
                    <View style={styles.flexView}>
                        <View style={[styles.iconNameView, { width: responsiveWidth(73) }]}>
                            <Image
                                source={termsMenu}
                                style={[styles.cardIconImg, { marginRight: responsiveWidth(3) }]}
                            />
                            <Text style={styles.textStyle}>{t('settings.AboutUs')}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
                <View style={[styles.horizontalLine, { borderColor: '#E3E3E3' }]} />
                <TouchableOpacity onPress={() => navigation.navigate('TermsConditions')}>
                <View style={styles.flexView}>
                    <View style={[styles.iconNameView, { width: responsiveWidth(73) }]}>
                        <Image
                            source={termsMenu}
                            style={[styles.cardIconImg, { marginRight: responsiveWidth(3) }]}
                        />
                        <Text style={styles.textStyle}>{t('settings.Terms&Conditions')}</Text>
                    </View>
                </View>
                </TouchableOpacity>
                <View style={[styles.horizontalLine, { borderColor: '#E3E3E3' }]} />
                <TouchableOpacity onPress={() => toggleLogoutModal()}>
                    <View style={styles.flexView}>
                        <View style={[styles.iconNameView, { width: responsiveWidth(73) }]}>
                            <Image
                                source={logoutMenu}
                                style={[styles.cardIconImg, { marginRight: responsiveWidth(3) }]}
                            />
                            <Text style={styles.textStyle}>{t('settings.LogOut')}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </ScrollView>
            <View style={{ width: responsiveWidth(90), alignSelf: 'center' }}>
                <CustomButton label={t('settings.DeleteMyAccount')}
                    // onPress={() => { login() }}
                    onPress={() => { toggleAccountDeleteModal() }}
                    buttonColor={'red'}
                />
            </View>
            {/* language change modal*/}
            <Modal isVisible={isModalVisible}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{t('settings.SelectLanguage')}</Text>
                    <TouchableOpacity onPress={() => selectLanguage('en')} style={styles.languageOption}>
                        <Text style={styles.languageText}>English</Text>
                        {langvalue === 'en' && <Icon name="check" size={20} color="#FB7401" />}
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => selectLanguage('hi')} style={styles.languageOption}>
                        <Text style={styles.languageText}>Hindi</Text>
                        {langvalue === 'hi' && <Icon name="check" size={20} color="#FB7401" />}
                    </TouchableOpacity>
                </View>
            </Modal>
            {/* logout modal*/}
            <Modal isVisible={isLogoutModalVisible}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{t('settings.logoutText')}</Text>
                    <View style={styles.buttonWrapper}>
                        <View style={{ width: responsiveWidth(30), alignSelf: 'center',marginBottom: -responsiveHeight(1) }}>
                            <CustomButton label={t('settings.No')}
                                // onPress={() => { login() }}
                                onPress={() => { toggleLogoutModal() }}
                                buttonColor={'gray'}
                            />
                        </View>
                        <View style={{ width: responsiveWidth(30), alignSelf: 'center' }}>
                            <CustomButton label={t('settings.Yes')}
                                // onPress={() => { login() }}
                                onPress={() => { logout() }}

                            />
                        </View>
                    </View>
                </View>
            </Modal>
            {/* logout modal*/}
            <Modal isVisible={isAccountDeleteModalVisible}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>{t('settings.deleteText')}</Text>
                    <View style={styles.buttonWrapper}>
                        <View style={{ width: responsiveWidth(30), alignSelf: 'center' }}>
                            <CustomButton label={t('settings.No')}
                                // onPress={() => { login() }}
                                onPress={() => { toggleAccountDeleteModal() }}
                                buttonColor={'gray'}
                            />
                        </View>
                        <View style={{ width: responsiveWidth(30), alignSelf: 'center' }}>
                            <CustomButton label={t('settings.Yes')}
                                // onPress={() => { login() }}
                                onPress={() => { deleteAccount() }}

                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default withTranslation()(SettingsScreen);

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    wrapper: {
        padding: 15,
    },
    flexView: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    iconNameView: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardIconImg: { height: 25, width: 25, resizeMode: 'contain' },
    IconImg: { height: 20, width: 20, resizeMode: 'contain' },
    textStyle: {
        color: '#1E2023',
        fontSize: responsiveFontSize(1.7),
        fontFamily: 'PlusJakartaSans-Medium',
    },
    horizontalLine: {
        borderWidth: 0.5,
        marginVertical: responsiveHeight(2),
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: responsiveFontSize(2.2),
        fontFamily: 'PlusJakartaSans-SemiBold',
        marginBottom: responsiveHeight(2),
        color: '#1E2023'
    },
    languageOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingVertical: responsiveHeight(1.5),
        borderBottomWidth: 1,
        borderBottomColor: '#E3E3E3',
    },
    languageText: {
        fontSize: responsiveFontSize(2),
        fontFamily: 'PlusJakartaSans-SemiBold',
        color: '#1E2023',
    },
    modalButton: {
        backgroundColor: 'orange',
        borderRadius: 5,
        paddingVertical: responsiveHeight(1),
        paddingHorizontal: responsiveWidth(10),
        marginTop: responsiveHeight(2),
    },
    buttonWrapper: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: responsiveWidth(70)
    },
});
