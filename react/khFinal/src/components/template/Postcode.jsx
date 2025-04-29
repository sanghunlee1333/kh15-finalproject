import { useCallback } from 'react';
import { useDaumPostcodePopup } from 'react-daum-postcode';

export default function Postcode({
    className="",
    children,
    onAddressSelected,//주소 선택시 우편번호, 기본주소 (zonecode, address) 값들을 줄 애들 한테 사용)  onAddressSelected={changeAddress} 이 changeAddress 로 전달
    ...rest
}) {
    const open = useDaumPostcodePopup("//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js");

    const handleComplete = useCallback(data => {
        //onAddressSelected가 없는 상황은 배제(안정성 향상)
        if(onAddressSelected === undefined) return;//전달이 안된 경우
        if(typeof onAddressSelected !== "function") return;//잘못 전달된 경우

        onAddressSelected(data.zonecode, data.address);
    }, []);

    return (
        <button type='button' className={className}
            onClick={e => open({ onComplete: handleComplete })}
            {...rest}>
            {children}
        </button>
    );

}