import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions';
import { withTranslation, useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const StepIndicator = ({ currentStep,lang }) => {
    //console.log(lang,'llllllll')
    const { t, i18n } = useTranslation();
    const [langvalue, setLangValue] = useState('en');

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
    return (
        <View style={styles.paginationcontainer}>
            <View style={styles.stepContainer}>
                <View style={[styles.circle, currentStep === 1 && styles.activeCircle]}>
                    <Text style={[styles.number, currentStep === 1 && styles.activeNumber]}>1</Text>
                </View>
                <Text style={[styles.label, currentStep === 1 && styles.activeLabel]}>{t('stepindicator.personalinfo')}</Text>
            </View>
            <View style={styles.lineContainer}>
                <View style={styles.line} />
            </View>
            <View style={styles.stepContainer}>
                <View style={[styles.circle, currentStep === 2 && styles.activeCircle]}>
                    <Text style={[styles.number, currentStep === 2 && styles.activeNumber]}>2</Text>
                </View>
                <Text style={[styles.label, currentStep === 2 && styles.activeLabel]}>{t('stepindicator.basicdetails')}</Text>
            </View>
            <View style={styles.lineContainer}>
                <View style={styles.line} />
            </View>
            <View style={styles.stepContainer}>
                <View style={[styles.circle, currentStep === 3 && styles.activeCircle]}>
                    <Text style={[styles.number, currentStep === 3 && styles.activeNumber]}>3</Text>
                </View>
                <Text style={[styles.label, currentStep === 3 && styles.activeLabel]}>{t('stepindicator.otherdetails')}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    paginationcontainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',  
        marginVertical: responsiveHeight(2),
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
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: responsiveFontSize(1.5),
    },
    activeNumber: {
        color: '#fff',
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: responsiveFontSize(1.5),
    },
    label: {
        marginTop: 5,
        color: '#8B939D',
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: responsiveFontSize(1.5),
    },
    activeLabel: {
        color: '#000',
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: responsiveFontSize(1.5),
    },
    lineContainer: {
        flex: 1,
        alignItems: 'center',
    },
    line: {
        position: 'absolute',
        top:-responsiveHeight(1.5),
        width: responsiveWidth(20),
        height: 1,
        backgroundColor: '#8B939D',
    },
});

export default  withTranslation()(StepIndicator);
