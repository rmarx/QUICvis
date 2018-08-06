<template>
    <li>
    <div @click="toggleChildren" class="haschildren">
        <i class="far fa-plus-square" v-if="!showChildren"></i>
        <i class="far fa-minus-square" v-else></i>
        {{ keyname }}
    </div>
    <ul>
        <div v-if="keyname !== 'payloadinfo'">
            <li  v-for="(info, key) in keyinfolist" v-if="showChildren">{{key}} : {{info}}</li>
        </div>
        <div v-else>
            <div v-for="(info, key) in keyinfolist" v-if="showChildren">
                <li v-for="frame in info">
                    {{ frameName(parseInt(frame.frametype))}}
                    <ul>
                        <li v-for="(frameinfo, framekey) in frame">{{ framekey }} : {{ frameinfo }}</li>
                    </ul>
                </li>
            </div>
        </div>
    </ul>
    </li>
</template>

<script lang="ts">
import { getFrameName } from '../../data/QuicNames'
export default {
    name: 'infoitem',
    props: ['keyname', 'keyinfolist', 'collapse'],
    data(){
        return {
            showChildren: this.collapse
        }
    },
    methods: {
        toggleChildren: function(){
            this.showChildren = !this.showChildren
        },
        frameName(frametype) {
            return getFrameName(frametype)
        }
    }
}
</script>
<style>
.haschildren{
    cursor: pointer;
}
</style>
