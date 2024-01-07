import axios from '../axios.js';
/**
 * 新增project
 * @param {*} data
 * @returns
 */
export const addProject = data => {
    return axios({
        url: '/api/projects/add',
        method: 'post',
        data
    })
}

/**
 * 获取项目列表
 * @param {*} data
 * @returns
 */
export const getProjectList = data => {
    return axios({
        url: '/api/projects/get',
        method: 'get',
        data
    })
}