// Handle error notifications
// useEffect(() => {
//     if (state.errors.length === 0) return;

//     state.errors.forEach((error, index) => {
//         push({
//             id: `N#PROFILE_ERROR_${index}`,
//             alert: error.message,
//             type: "alert",
//             options: { variant: "danger" }
//         });
//     });

//     // Clear errors after showing notifications
//     dispatch({ type: 'CLEAR_ERRORS' });
// }, [state.errors, push]);

// useEffect(() => {
//     if ([
//         !provider.error,
//         profileState !== "logged"
//     ].includes(true)) return;

//     push({
//         id: `N#PROCESSING_CART_ERROR`,
//         alert: "Ocorreu um error ao processar o carrinho, por favor tenta novamente",
//         type: "alert",
//         options: { ttl: APP_TTL_DEFAULT, variant: "danger" }
//     });

//     updateProvider(p => { return { ...p, error: null, state: "idle" } });
// }, [provider.error, profileState, push]);