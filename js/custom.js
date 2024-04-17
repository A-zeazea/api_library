// UI control=======================================================
//header 높이
const headerHeight = document.querySelector('header').scrollHeight;
const bottomHeight = document.querySelector('.bottom-bar').scrollHeight;

// section .map-wrapper 요소 저장
const section = document.querySelector('section .container');
const details = document.querySelector('.details'); // details 요소 저장.

section.style.height = `calc(100vh - ${headerHeight}px)`; // 100vh 에서 header
details.style.bottom = `calc(${bottomHeight}px + 20px)`; // bottom 높이에서 15px만큼 details 위로 고정

// 도서관 api 데이터 가공 2022년 이후 데이터 중
// 위도가 주어지는 데이터만 필터링===========================================
const lib_data = data.records;

const current = lib_data.filter((item) => {
  return item.데이터기준일자.split('-')[0] >= '2022' && item.위도 !== '';
});

// console.log(current);

// naver map api 정보
// client ID : 8xx1pcmnzi
// client secret : xd7OagjBLdHUDACu3Ou8JgZLs80DoGOPTEwSwT4T

//input clilck event
const input = document.querySelector('.search-bar input'); //input 요소 저장
const btn = document.querySelector('.search-bar button'); //button 요소 저장
const loading = document.querySelector('.loading');
const mapElmt = document.querySelector('#map');

//1. 처음 로딩 시 on 클래스 추가
loading.classList.add('on');

btn.addEventListener('click', function () {
  const detailsWrapper = document.querySelector('.details');
  detailsWrapper.style.display = 'none'; // 초기 활성화 시 디테일 요소 숨김

  const value = input.value; // input에 작성된 값을 value로 읽는다.
  if (value === '') {
    alert('검색어를 입력해 주세요.');
    input.focus();
    return;
  }

  mapElmt.innerHTML = ''; // 초기 활성화 시 모든 Map 자식 요소 삭제
  const searchResult = current.filter((item) => {
    return item.도서관명.includes(value) || item.시군구명.includes(value);
  });

  // console.log(searchResult);

  // 2. button 클릭 시 on 클래스 추가 > 얘는 그냥 안없어짐 아래 조건을 완료해야 없어짐
  loading.classList.add('on');

  startLenderLocation(searchResult[0].위도, searchResult[0].경도);
}); //button 클릭 시 실행할 함수

input.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    // enter의 keycode는 13이다. / 시작을 Input으로 해뒀기 때문에, 커서가 입력창에 가있어야 발동됨.
    btn.click();
  }
}); // input에서 enter key 입력 시 실행할 함수

//====================
// NAVER MAP API CODES
//====================

// 현재 위치 파악
navigator.geolocation.getCurrentPosition((position) => {
  let lat = position.coords.latitude;
  let lng = position.coords.longitude;

  // 위의 현재 위치를 파라미터로 받아와, 중앙을 현재 위치로 픽스
  startLenderLocation(lat, lng); // 새로운 함수 호출
});

function startLenderLocation(la, ln) {
  var map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(la, ln),
    zoom: 14,
  });

  // 마커
  var marker = new naver.maps.Marker({
    position: new naver.maps.LatLng(la, ln),
    map: map,
  });

  current.forEach((item) => {
    // console.log(item.위도, item.경도);
    let latLng = new naver.maps.LatLng(item.위도, item.경도);

    // 화면 범위 내의 도서관만 마커로 표시
    let bounds = map.getBounds();
    // console.log(bounds);

    if (bounds.hasLatLng(latLng)) {
      let marker = new naver.maps.Marker({
        position: latLng,
        map: map,
      });

      // 마커 정보창
      let infoWindow = new naver.maps.InfoWindow({
        content: `
        <h4 style="padding:0.25rem; font-size:14px; font-weight:normal; color:#fff; background: #222; border-radius:6px; anchorColor: #222;">${item.도서관명}</h4>
        `,
        maxWidth: 140,
        backgroundColor: '#fff',
        // borderColor: '#222',
        // borerRadious: '6px',
        anchorSkew: true,
        anchorColor: '#222',
      });

      naver.maps.Event.addListener(marker, 'click', function () {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(map, marker);
        }

        const markerInfoData = {
          itemCount: item['자료수(도서)'],
          serialItemCount: item['자료수(연속간행물)'],
          notBookItemCount: item['자료수(비도서)'],
          sitCount: item.열람좌석수,
          wdStart: item.평일운영시작시각,
          wdEnd: item.평일운영종료시각,
          wkStart: item.토요일운영시작시각,
          wkEnd: item.토요일운영종료시각,
          contact: item.도서관전화번호,
          address: item.소재지도로명주소,
          homePage: item.홈페이지주소,
        };

        getInfoOnMarker(markerInfoData);
      });
    }
  }); // end of current forEach method

  // 3. 모든 지도 요소가 추가 완료되면 on 클래스 제거
  loading.classList.remove('on');
}

function getInfoOnMarder(data) {
  const detailsWrapper = document.querySelector('.details');
  detailsWrapper.style.display = 'none'; //초기 활성화 시 모든 details 요소 숨김
  detailsWrapper.innerHTML = ''; //초기 활성화 시 모든 details 자식 요소 삭제

  const infoElmt = `
  <div class="title">
  <h2>${data.title}</h2>
  <i class="ri-close-circle-fill"></i>
 </div>
 
 
 <div class="info">
  <!-- 중요 정보 -->
  <div class="boxinfo">
    <div class="red1">
      <h3>도서</h3>
      <h3>${data.itemCount}</h3>
    </div>
    <div class="red2">
      <h3>연속간행물</h3>
      <h3>${data.serialItemCount}</h3>
    </div>
    <div class="red3">
      <h3>비도서</h3>
      <h3>${data.notBookItemCount}</h3>
    </div>
    <div class="blue">
      <h3>열람좌석수</h3>
      <h3>${data.sitCount}</h3>
    </div>
  </div>
  <!-- 기본 정보 -->
  <div class="letterinfo">
    <div class="time">
      <div class="info-title">운영시간 :</div>
      <div class="info-contents">
        <p class="weekday">${data.wdStart} ~ ${data.wdEnd}(평일)</p>
        <p class="weekend">${data.wkStart} ~ ${data.wkEnd} (토요일 및 공휴일)</p>
        <p class="msg">* 공휴일 휴관</p>
      </div>
    </div>
    <div class="call">
      <div class="info-title">연락처 :</div>
      <div class="info-contents">
        <p class="call_each">${data.contact}</p>
      </div>
    </div>
    <div class="address">
      <div class="info-title">주소 :</div>
      <div class="info-contents">
        <p class="address_each">${data.address}</p>
      </div>
    </div>
  </div>
 </div>
 
 
 <!-- 홈페이지로 이동 -->
 <div class="link">
  <a href="${data.homePage}" class="#">홈페이지로 연결</a>
 </div>
  `;

  detailsWrapper.insertAdjacentHTML('beforeend', infoElmt);
  detailsWrapper.style.display = 'block';
}

document.addEventListener('click', function (e) {
  if (e.target.classList.contains('ri-close-circle-fill')) {
    const detailsWrapper = document.querySelector('.details');
    detailsWrapper.style.display = 'none';
  }
});
