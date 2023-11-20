<script>
    import '../../global.css';
    export let data = [];
  
    function fetchCity() {
      // You can use the 'data' directly here
      const name = data[0]?.name || '';
      const country = data[0]?.country || '';
      console.log(name, country);
    }
  </script>
  
  <main class="main-container">
    <h1>Welcome to SvelteKit Playground</h1>
    <button on:click={fetchCity}>Get City</button>
  
    {#if data.length > 0}
      <p>{data[0]?.country}</p>
    {/if}
  </main>
  
  <div class="avatar" data-tooltip={data[0]?.name}></div>
  
  <style>
    .main-container {
      text-align: center;
      padding: 1em;
    }
  
    .avatar {
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background-image: url('https://www.akc.org/wp-content/uploads/2017/11/Chinook-On-White-03.jpg');
      background-size: cover;
      background-position: center;
      position: relative;
    }
  
    .avatar::before,
    .avatar::after {
      --scale: 0;
      position: absolute;
      top: -0.25rem;
      left: 50%;
      transform: translateX(-50%) translateY(-100%) scale(var(--scale));
      transition: 150ms transform ease-in-out;
      transform-origin: bottom center;
    }
  
    .avatar::before {
      content: attr(data-tooltip);
      color: white;
      padding: 0.5rem;
      border-radius: 0.3rem;
      text-align: center;
      width: max-content;
      max-width: 100%;
      background-color: #333;
    }
  
    .avatar:hover::before {
      --scale: 1;
    }
  </style>
  