// export async function load() {
//     const name = 'Lisbon';
//     const url = 'https://api.api-ninjas.com/v1/city?name=' + name;
//     const options = {
//       method: 'GET',
//       headers: {
//         'X-Api-Key': 'Km5SONS3mRfJKooaqqTDrg==FpbHfc7fISCVmm5H',
//       },
//       contentType: 'application/json',
//     };
  
//     const response = await fetch(url, options);
//     const data = await response.json();
  
//     const country = data[0]?.country || '';
  
//     // Returning the data to be passed to the Svelte component
//     return {
//       props: {
//         data,
//         name,
//         country,
//         url,
//         options,
//       },
//     };
//   }
  