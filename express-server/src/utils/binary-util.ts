export class BinaryUtil {
    public static uint8ToBase64(uint8Array: Uint8Array) {
        let binary = '';
        
        for (let i = 0; i < uint8Array.length; i++) {
          binary += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binary);
    }
}
