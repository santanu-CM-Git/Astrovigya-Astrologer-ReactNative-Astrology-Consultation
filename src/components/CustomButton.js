import { Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import React from 'react';
import { chatImg, forwordImg } from '../utils/Images';
import { responsiveFontSize } from 'react-native-responsive-dimensions';

export default function CustomButton({ label, onPress, buttonIcon, buttonColor }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={buttonColor == 'red' ? styles.buttonViewRed : buttonColor == 'gray' ? styles.buttonViewGray : buttonColor == 'small' ? styles.buttonViewSmall : styles.buttonView}>

      <Text
        style={buttonColor == 'red' ? styles.buttonTextRed : buttonColor == 'gray' ? styles.buttonTextGray : styles.buttonText}>
        {label}
      </Text>
      {buttonIcon ? <Image source={forwordImg} style={styles.iconImage} tintColor={'#FFF'} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  buttonView: {
    backgroundColor: '#FB7401',
    borderColor: '#FB7401',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonViewSmall: {
    backgroundColor: '#EEF8FF',
    borderColor: '#417AA4',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonViewRed: {
    backgroundColor: '#FFF',
    borderColor: '#FB7401',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonViewGray: {
    backgroundColor: '#F2F4F6',
    borderColor: '#DAE0EA',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buttonText: {
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
    fontSize: responsiveFontSize(1.7),
    color: '#FFFFFF',
  },
  buttonTextRed: {
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
    fontSize: responsiveFontSize(1.7),
    color: '#FB7401',
  },
  buttonTextGray: {
    fontFamily: 'PlusJakartaSans-Bold',
    textAlign: 'center',
    fontSize: responsiveFontSize(1.7),
    color: '#8B939D',
  },
  iconImage: {
    width: 23,
    height: 23,
    marginLeft: 5
  }
})
