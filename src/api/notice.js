import { getItemWithExpiry } from "./LoginAndReg";
import { showMsg } from "@/components/msgbox";

const apiUrl = import.meta.env.VITE_API_BASE_URL;

async function getNoticesNum() {
    const token = getItemWithExpiry('token');
    if (!token) {
        return null;
    }
    const response = await fetch(`${apiUrl}/auth/getNoticeNum`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    const data = await response.json();
    return data;
}

async function getNotices(requireID,pageSize,read) {
    const token = getItemWithExpiry('token');
    if (!token) {
        return null;
    }
    const params = `requireID=${requireID}&pageSize=${pageSize}&read=${read}`;
    const response = await fetch(`${apiUrl}/auth/getNotice?${params}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    const data = await response.json();
    return data;
}

async function readNotice(id) {
    const token = getItemWithExpiry('token');
    if (!token) {
        return null;
    }
    const response = await fetch(`${apiUrl}/auth/readNotice/${id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });
    const data = await response.json();
    showMsg(data.msg);
}

export { getNoticesNum, getNotices, readNotice };