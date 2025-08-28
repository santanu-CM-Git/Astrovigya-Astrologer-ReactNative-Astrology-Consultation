import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Image, Platform, Alert, Button } from 'react-native'
import CustomHeader from '../../components/CustomHeader'
import CustomButton from '../../components/CustomButton';
import { responsiveFontSize, responsiveHeight, responsiveWidth } from 'react-native-responsive-dimensions'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { addImg, ArrowGratter, dateIcon, deleteImg, plus, timeIcon } from '../../utils/Images'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Entypo';
import Modal from "react-native-modal";
import moment from 'moment-timezone';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import axios from 'axios';
import { API_URL } from '@env'
import Toast from 'react-native-toast-message';
import { Dropdown } from 'react-native-element-dropdown';
import CheckBox from '@react-native-community/checkbox';
import Loader from '../../utils/Loader';
import InputField from '../../components/InputField';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { withTranslation, useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context'
const ServiceScreen = ({  }) => {
    const navigation = useNavigation();
    const { t, i18n } = useTranslation();
    const [isLoading, setIsLoading] = useState(true)
    const [rate, setRate] = useState('')
    const [toggleCheckBox, setToggleCheckBox] = useState(true)
    const [rateErr, setRateErr] = useState('')
    const [rateRemediesErr, setrateRemediesErr] = useState('')
    const [deductionPermissionErr, setDeductionPermissionErr] = useState('')
    const [remediesvalue, setYearValue] = useState(null);
    const [isRemediesFocus, setYearIsFocus] = useState(false);
    const [remediesrate, setRemediesRate] = useState(0)
    const [services, setServices] = useState([]);
    const [dataRemedies, setdataRemedies] = useState([])
    const [minAmount, setMinAmount] = useState(0);

    // const addService = () => {
    //     setServices([...services, { remediesvalue: null, remediesrate: 0 }]);
    // };
    const addService = () => {
        // Check if a duplicate remedy is selected
        const existingRemedies = services.map(service => service.remediesvalue);
        if (existingRemedies.includes(null)) {
            setDeductionPermissionErr('Please select a remedy for the previous service before adding a new one.');
            return;
        }
        setDeductionPermissionErr(''); // Clear error if no duplicates found
        setServices([...services, { remediesvalue: null, remediesrate: 0 }]);
    };

    const removeService = (index) => {
        const updatedServices = [...services];
        updatedServices.splice(index, 1);
        setServices(updatedServices);
    };

    const isValidNumber = (value) => {
        const number = parseFloat(value);  // Convert the value to a number
        return !isNaN(number) && Number.isFinite(number);  // Check if it's a valid number
    };

    const handleSubmit = () => {
        const remedyValues = services.map(service => service.remediesvalue);
        const hasDuplicate = remedyValues.some((value, index) => remedyValues.indexOf(value) !== index);

        if (hasDuplicate) {
            handleAlert('Duplicate Remedy', 'Each remedy should only be added once. Please remove duplicates.');
            return;
        }

        if (toggleCheckBox) {
            if (!rate) {
                setRateErr('Rate is empty. Please enter a rate.');
            } else if (isValidNumber(rate)) {
                setIsLoading(true);
                console.log(rate, 'rateeee');
                console.log(services, 'serviceeee');
                const transformedData = services.map(item => ({
                    puja_id: parseInt(item.remediesvalue, 10),           // Convert remediesvalue to integer for puja_id
                    consultation_cost: parseInt(item.remediesrate, 10)   // Convert remediesrate to integer for consultation_cost
                }));
                AsyncStorage.getItem('userToken', async (err, usertoken) => {
                    const savedLang = await AsyncStorage.getItem('selectedLanguage');
                    const option = {
                        "rate_price": rate,
                        "remedies": transformedData
                    }
                    console.log(option);

                    axios.post(`${API_URL}/astrologer/astrologer-service`, option, {
                        headers: {
                            "Authorization": `Bearer ${usertoken}`,
                            "Content-Type": 'application/json',
                            'Accept-Language': savedLang,
                        },
                    })
                        .then(res => {
                            setIsLoading(false);
                            console.log(res.data, 'after service add')
                            if (res?.data?.response) {
                                Toast.show({
                                    type: 'success',
                                    text1: '',
                                    text2: res?.data?.message,
                                    position: 'top',
                                    topOffset: Platform.OS == 'ios' ? 55 : 20
                                });
                                navigation.navigate('Home')
                            } else {
                                handleAlert('Oops..', res?.data?.message);
                            }

                        })
                        .catch(e => {
                            console.log(`astrologer-service error ${e}`)
                            console.log(e.response?.data?.message)
                        });
                });
            } else {
                setRateErr('Invalid rate. Please enter a valid number.');
            }
        } else {
            setDeductionPermissionErr('Please check the necessary permissions.')
        }
    }

    const handleAlert = (title, message) => {
        Alert.alert(title, message, [
            {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);
    };

    const fetchAstrologerDetails = () => {

        AsyncStorage.getItem('userToken', async (err, usertoken) => {
            const savedLang = await AsyncStorage.getItem('selectedLanguage');
            axios.get(`${API_URL}/astrologer/astrologer-service`, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json',
                    'Accept-Language': savedLang,
                },
            })
                .then(res => {
                    setIsLoading(false);
                    console.log(res?.data, 'rate details')
                    setRate(res?.data?.astrology?.rate_price)
                    const servicedata = res?.data?.data;
                    console.log(servicedata, 'nnn')
                    const blankArr = [];

                    // Loop through the servicedata and push the transformed data to blankArr
                    servicedata.map(item => {
                        console.log('Item:', item); // Log the entire item
                        blankArr.push({
                            remediesvalue: (item.consultation.id || null).toString(), // Convert to string
                            remediesrate: (item.rate_price || 0).toString() // Convert to string
                        });
                    });
                    console.log(blankArr, 'jjjj')

                    setServices(blankArr)

                    // Get the current state and merge only unique items
                })
                .catch(e => {
                    console.log(`astrologer-service error ${e}`)
                    console.log(e.response?.data?.message)
                });
        });
    }

    const fetchPuja = () => {

        AsyncStorage.getItem('userToken', async (err, usertoken) => {
            const savedLang = await AsyncStorage.getItem('selectedLanguage');
            axios.get(`${API_URL}/astrologer/get-puja-name`, {
                headers: {
                    "Authorization": `Bearer ${usertoken}`,
                    "Content-Type": 'application/json',
                    'Accept-Language': savedLang,
                },
            })
                .then(res => {
                    //setIsLoading(false);
                    console.log(res?.data, 'puja details')
                    const pujalist = res?.data?.data
                    const transformedData = pujalist.map(item => ({
                        label: item.name,
                        value: item.id.toString(),
                        minAmount: item.min_amount
                    }));
                    setdataRemedies(transformedData)

                })
                .catch(e => {
                    console.log(`astrologer-service error ${e}`)
                    console.log(e.response?.data?.message)
                });
        });
    }

    useEffect(() => {
        fetchPuja()
        fetchAstrologerDetails()

    }, [])
    useFocusEffect(
        React.useCallback(() => {
            fetchPuja()
            fetchAstrologerDetails()
        }, [])
    )

    if (isLoading) {
        return (
            <Loader />
        )
    }

    return (
        <SafeAreaView style={styles.Container}>
            <CustomHeader commingFrom={'My Services'} onPress={() => navigation.goBack()} title={t('Myservice.MyServices')} />
            <ScrollView style={styles.wrapper}>
                <View style={{ marginBottom: responsiveHeight(0) }}>
                    <Text style={styles.headerText}>{t('Myservice.OnlineConsultation')}</Text>
                </View>
                <View style={styles.textinputview}>
                    <InputField
                        label={"Astrology"}
                        keyboardType=""
                        value={"Astrology"}
                        inputType={'nonedit'}
                        onChangeText={(text) => onChangeText(text)}
                        editable={'nonedit'}
                    />
                </View>
                <View style={{ marginBottom: responsiveHeight(0) }}>
                    <Text style={styles.headerText}>{t('Myservice.rate')}<Text style={{ color: 'red' }}> *</Text></Text>
                </View>
                {rateErr ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{rateErr}</Text> : <></>}
                <View style={styles.textinputview}>
                    <InputField
                        label={"Rate"}
                        keyboardType=""
                        value={rate}
                        inputType={'others'}
                        onChangeText={(text) => {
                            setRate(text)
                            setRateErr('')
                        }}
                        editable={'nonedit'}
                    />
                </View>
                <View
                    style={{
                        borderBottomColor: '#8B939D',
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        marginVertical: responsiveHeight(2)
                    }}
                />
                {services.map((service, index) => (
                    <View key={index} style={{ marginBottom: responsiveHeight(2) }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.header}>{t('Myservice.Remedies')}</Text>
                            <TouchableOpacity onPress={() => removeService(index)}>
                                <Image
                                    source={deleteImg}
                                    style={{ height: 19, width: 19, resizeMode: 'contain' }}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            {service.remediesvalue ? (
                                // Display non-editable text if a value is already selected
                                <View style={[styles.dropdownHalf, { borderColor: '#DDD' }]}>
                                    <Text style={[styles.selectedTextStyle, { paddingVertical: 10, paddingHorizontal: 8 }]} numberOfLines={1}>
                                        {dataRemedies.find(item => item.value === service.remediesvalue)?.label || 'Selected Remedy'}
                                    </Text>
                                </View>
                            ) : (
                                <Dropdown
                                    style={[styles.dropdownHalf, { borderColor: '#DDD' }]}
                                    placeholderStyle={styles.placeholderStyle}
                                    selectedTextStyle={styles.selectedTextStyle}
                                    inputSearchStyle={styles.inputSearchStyle}
                                    itemTextStyle={styles.selectedTextStyle}
                                    data={dataRemedies}
                                    maxHeight={300}
                                    labelField="label"
                                    valueField="value"
                                    placeholder={"Select Remedies"}
                                    searchPlaceholder="Search..."
                                    value={service.remediesvalue}
                                    onFocus={() => setYearIsFocus(true)}
                                    onBlur={() => setYearIsFocus(false)}
                                    onChange={item => {
                                        const updatedServices = [...services];
                                        updatedServices[index].remediesvalue = item.value;
                                        updatedServices[index].remediesminrate = item.minAmount.toString();
                                        updatedServices[index].rateError = ''; // Clear error when changing the remedy
                                        updatedServices[index].isRateValid = false;
                                        setServices(updatedServices);
                                    }}

                                />
                            )}
                        </View>
                        <View style={{ marginBottom: responsiveHeight(0) }}>
                            <Text style={styles.headerText}>
                                {t('Myservice.RemediesRate')}
                                {!service?.remediesvalue && (
                                    <> (min amount {service?.remediesminrate})</>
                                )}
                                <Text style={{ color: 'red' }}> *</Text>
                            </Text>
                        </View>
                        <View style={styles.textinputview}>
                            <InputField
                                label={"Remedies Rate"}
                                keyboardType="numeric"
                                value={service.remediesrate}
                                inputType={'remediesrate'}
                                onChangeText={(text) => {
                                    const updatedServices = [...services];
                                    updatedServices[index].remediesrate = text;

                                    // Reset error message when user starts typing again
                                    updatedServices[index].rateError = '';
                                    updatedServices[index].isRateValid = false;
                                    setServices(updatedServices);
                                }}
                                onBlur={() => {
                                    console.log('gvf')
                                    const enteredRate = parseFloat(service.remediesrate);
                                    const minRate = parseFloat(service.remediesminrate);

                                    const updatedServices = [...services];

                                    // Debugging Log
                                    console.log("Entered Rate:", enteredRate);
                                    console.log("Min Rate:", minRate);

                                    // Ensure enteredRate and minRate are valid numbers
                                    if (isNaN(enteredRate) || isNaN(minRate)) {
                                        updatedServices[index].rateError = 'Invalid rate value.';
                                        updatedServices[index].isRateValid = false;
                                    } else if (enteredRate < minRate) {
                                        updatedServices[index].rateError = `Rate cannot be less than the minimum amount of ${minRate}`;
                                        updatedServices[index].isRateValid = false;
                                    } else {
                                        updatedServices[index].rateError = ''; // Clear error if valid
                                        updatedServices[index].isRateValid = true;
                                    }

                                    // Debugging Log for rateError
                                    console.log("Updated Rate Error:", updatedServices[index].rateError);

                                    setServices(updatedServices);
                                }}
                                editable={!service.isRateValid}
                            />
                        </View>
                        {/* Only show the error for the specific service that has the invalid rate */}
                        {service.rateError ? (
                            <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>
                                {service.rateError}
                            </Text>
                        ) : null}
                    </View>
                ))}
                <View style={styles.termsView}>
                    <View style={styles.checkboxContainer}>
                        <CheckBox
                            disabled={false}
                            value={toggleCheckBox}
                            onValueChange={(newValue) => {
                                setToggleCheckBox(newValue)
                                setDeductionPermissionErr('')
                            }}
                            tintColors={{ true: '#FB7401', false: '#444343' }}
                        />
                    </View>
                    <Text style={styles.termsText}>{t('Myservice.feeText')}</Text>
                </View>
                {deductionPermissionErr ? <Text style={{ color: 'red', fontFamily: 'PlusJakartaSans-Regular' }}>{deductionPermissionErr}</Text> : <></>}
            </ScrollView>

            <TouchableOpacity style={styles.addButton} onPress={addService}>
                <View style={styles.inActiveButtonInsideView}>
                    <Image
                        source={addImg}
                        style={{ height: 15, width: 15, resizeMode: 'contain', marginRight: 5 }}
                    />
                    <Text style={styles.activeButtonInsideText}>{t('Myservice.AddNewService')}</Text>
                </View>
            </TouchableOpacity>
            <View style={styles.buttonwrapper}>
                <CustomButton
                    label={t('Myservice.Submit')}
                    onPress={() => handleSubmit()}
                />
            </View>
        </SafeAreaView>
    )
}


export default withTranslation()(ServiceScreen)


const styles = StyleSheet.create({
    Container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    wrapper: {
        paddingHorizontal: 15,
        //marginBottom: responsiveHeight(1)
    },
    textinputview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: responsiveWidth(100)
    },
    headerText: {
        color: '#2D2D2D',
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: responsiveFontSize(1.7),
        marginBottom: responsiveHeight(1)
    },
    termsView: {
        marginBottom: responsiveHeight(2),
        alignItems: 'center',
        flexDirection: 'row',
    },
    termsText: {
        color: '#746868',
        fontFamily: 'PlusJakartaSans-Regular',
        fontSize: responsiveFontSize(1.5),

    },
    checkboxContainer: {
        ...Platform.select({
            ios: {
                transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }]  // Adjust scale values as needed
            },
            android: {
                transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }]  // Adjust scale values as needed
            }
        })
        // Adjust the scale values to control the size
    },
    activeButtonInsideText: {
        color: '#2D2D2D',
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: responsiveFontSize(1.7)
    },
    inActiveButtonInsideView: {
        backgroundColor: '#FEF3E5',
        height: responsiveHeight(6),
        width: responsiveWidth(92),
        borderRadius: 12,
        borderColor: '#FEF3E5',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: 15,
    },
    addButton: {
        // position: 'absolute',
        bottom: responsiveHeight(2),
        // left: responsiveWidth(4),
        // right: responsiveWidth(4),
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: responsiveHeight(2),
        marginBottom: -responsiveHeight(2)
    },
    header: {
        fontFamily: 'PlusJakartaSans-SemiBold',
        fontSize: responsiveFontSize(1.7),
        color: '#2F2F2F',
        marginBottom: responsiveHeight(1),
    },
    dropdownHalf: {
        height: responsiveHeight(6),
        width: responsiveWidth(91.5),
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
    buttonwrapper: {
        width: responsiveWidth(92),
        marginVertical: responsiveHeight(2),
        alignSelf: 'center'
    },
});
