const apiUrl = import.meta.env.VITE_API_BASE_URL;
async function getHeatPosts(){
    const response =await fetch(`${apiUrl}/auth/calculateHeat`,{
        method:'GET',
        headers:{
            'Content-Type':'application/json',
            'Authorization':`Bearer ${localStorage.getItem('token')}`
        }
    })
    const data = await response.json()
    return data
}

export { getHeatPosts }