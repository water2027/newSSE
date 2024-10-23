import { showMsg } from "@/components/MessageBox";
import { requestFunc } from "../req";

async function getNoticesNum() {
    try{
        const res = await requestFunc(`/auth/getNoticeNum`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },true);
        if(!res.ok){
            showMsg('获取通知数量失败');
            return null;
        }
        const data = await res.json();
        return data;
    }catch(e){
        showMsg('获取通知数量失败');
        console.error(e);
    }
}

async function getNotices(requireID,pageSize,read) {
    const params = `requireID=${requireID}&pageSize=${pageSize}&read=${read}`;
    try{
        const res = await requestFunc(`/auth/getNotice?${params}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },true);
        const data = await res.json();
        return data;
    }catch(e){
        showMsg('获取通知失败')
        console.error(e)
    }
}

async function readNotice(id) {
    try{
        const res = await requestFunc(`/auth/readNotice/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
        },true);
        const data = await res.json();
        return data;
    }catch(e){
        console.error(e)
        showMsg('读通知失败')
    }
}

export { getNoticesNum, getNotices, readNotice };