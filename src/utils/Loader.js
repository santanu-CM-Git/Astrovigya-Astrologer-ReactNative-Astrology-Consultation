import React from 'react';
import {
    View,
    ActivityIndicator,
    StyleSheet
} from 'react-native';

export default function Loader({  }) {
    return (
        <View style={styles.Container}>
            <ActivityIndicator
                size="large" color={'#FB7401'}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    Container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 20
    }
});

