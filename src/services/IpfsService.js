import ipfsAPI from 'ipfs-api';

class IpfsService {

    upload(file, improcessCallBack) {
        return new Promise((resolve, reject) => {
            let reader = new window.FileReader();
            let ipfsApi = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https'});
            reader.onloadend = () => {
                const buffer = Buffer.from(reader.result);
                let option = {};
                if (improcessCallBack) {
                    option = {
                        progress: improcessCallBack
                    };
                }
                ipfsApi.add(buffer, option)
                    .then((response) => {
                        resolve('https://ipfs.io/ipfs/' + response[0].hash);
                    })
                    .catch((err) => {
                        reject(err)
                    })
            };
            reader.readAsArrayBuffer(file)
        })
    }
}

export default new IpfsService();