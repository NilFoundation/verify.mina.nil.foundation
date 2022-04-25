$.fn.upform = function() {
    var $this = $(this);
    var container = $this.find(".upform-main");

    function checkProofCorrectness(proof) {
        try {
            t0 = Module.ccall('parse_proof', // name of C function
                'string', // return type
                ['string'], // argument types
                [proof.val()]);
            proof.parent().removeClass("alert-danger");
            proof.parent().addClass("alert-success");
        } catch (e) {
            proof.parent().removeClass("alert-success");
            proof.parent().addClass("alert-danger");
        }
    }

    //Created check function to see if the MetaMask extension is installed
    function isMetaMaskInstalled() {
        //Have to check the ethereum binding on the window object to see if it's installed
        const { ethereum } = window;
        return Boolean(ethereum && ethereum.isMetaMask);
    }

    function checkProofVkCorrectness(vk, vk_const) {
        try {
            t0 = Module.ccall('parse_pconst', // name of C function
                'string', // return type
                ['string', 'string'], // argument types
                [vk.val(), vk_const.val()]);
            vk.parent().removeClass("alert-danger");
            vk.parent().addClass("alert-success");

            vk_const.parent().removeClass("alert-danger");
            vk_const.parent().addClass("alert-success");
        } catch (e) {
            vk.parent().removeClass("alert-success");
            vk.parent().addClass("alert-danger");

            vk_const.parent().removeClass("alert-success");
            vk_const.parent().addClass("alert-danger");
        }
    }

    $(document).ready(function() {
        $(container).find(".input-block").first().click();

        $(container).find('.tickerwrapper').css({"display": "none"});

        $('#mina-state-proof').on('input', function() {
            var field = $('#mina-state-proof');
            checkProofCorrectness(field);

            if (field.parent().hasClass('alert-danger')) {
                $(container).find('.input-block input[name="q2"].toggle-left').attr('disabled', 'disabled');
                $(container).find('label[for="toggle-on-q2"]').css({"opacity": "0.25"});
            } else {
                $(container).find('.input-block input[name="q2"].toggle-left').removeAttr('disabled');
                $(container).find('label[for="toggle-on-q2"]').css({"opacity": "1"});
            }
        });

        $('#mina-state-proof-vk').on('input', function() {
            checkProofVkCorrectness($('#mina-state-proof-vk'), $('#mina-state-proof-const'));

            if ($('#mina-state-proof-vk').parent().hasClass('alert-danger') || 
                $('#mina-state-proof-const').parent().hasClass('alert-danger')) {
                $(container).find('.input-block input[name="q2"].toggle-left').attr('disabled', 'disabled');
                $(container).find('label[for="toggle-on-q2"]').css({"opacity": "0.25"});
            } else {
                $(container).find('.input-block input[name="q2"].toggle-left').removeAttr('disabled');
                $(container).find('label[for="toggle-on-q2"]').css({"opacity": "1"});
            }
        });

        $('#mina-state-proof-const').on('input', function() {
            checkProofVkCorrectness($('#mina-state-proof-vk'), $('#mina-state-proof-const'));

            if ($('#mina-state-proof-vk').parent().hasClass('alert-danger') || 
                $('#mina-state-proof-const').parent().hasClass('alert-danger')) {
                $(container).find('.input-block input[name="q2"].toggle-left').attr('disabled', 'disabled');
                $(container).find('label[for="toggle-on-q2"]').css({"opacity": "0.25"});
            } else {
                $(container).find('.input-block input[name="q2"].toggle-left').removeAttr('disabled');
                $(container).find('label[for="toggle-on-q2"]').css({"opacity": "1"});
            }
        });

        $(container).find('.input-block input[name="q1"].toggle-left').on('click', async () => {
            checkProofCorrectness($('#mina-state-proof'));
            checkProofVkCorrectness($('#mina-state-proof-vk'), $('#mina-state-proof-const'));
        });

        $('#mtmsk-btn').on('click', function() {
            ethereum.request({ method: 'eth_requestAccounts' });
        });

        $(container).find('.input-block input[name="q2"].toggle-left').on('click', async () => {
            $('#aux-proof-gen-pb').css({"display": "block"});
            $('#data-blob-input').css({"display": "none"});

            var worker = new Worker('../js/aux-proof-gen.js');
            worker.onmessage = function (e) {
                $('#data-blob').val(e.data);
                $('#aux-proof-gen-pb').css({"display": "none"});
                $('#data-blob-input').css({"display": "block"});

                $(container).find('.input-block input[name="q3"].toggle-left').removeAttr('disabled');
                $(container).find('label[for="toggle-on-q3"]').css({"opacity": "1"});
            }
            worker.postMessage("generate_proof");
            $(container).find('.input-block input[name="q3"].toggle-left').attr('disabled', 'disabled');
            $(container).find('label[for="toggle-on-q3"]').css({"opacity": "0.25"});
        });

        $(container).find('.input-block input[name="q4"].toggle-left').on('click', async () => {
            myBundle.verifyPlaceholderUnifiedAddition(
                $('#data-blob').val(), 
                $('#passphrase').val()).then(res => {
                    $('#proof-result').val("Result verify: " + res.verify); 
                    $('#proof-result-gas').val("Gas value: " + res.gasUsed);
                })
        });

        if (isMetaMaskInstalled()) {
            $(container).find('.input-block input[name="q4"].toggle-left').removeAttr('disabled');
            $(container).find('label[for="toggle-on-q4"]').css({"opacity": "1"});
        } else {
            $(container).find('.input-block input[name="q4"].toggle-left').attr('disabled', 'disabled');
            $(container).find('label[for="toggle-on-q4"]').css({"opacity": "0.25"});
        }

        fetch("https://raw.githubusercontent.com/NilFoundation/evm-mina-verification/master/share/mina/proof_9b0369c27bb85c8ab2f8725c6e977eb27b53b826.json")
            .then(result => result.json())
            .then(data => $('#mina-state-proof').val(JSON.stringify(data)));

        fetch("https://raw.githubusercontent.com/NilFoundation/evm-mina-verification/master/bin/aux-proof-gen/src/data/kimchi_const.json")
            .then(result => result.json())
            .then(data => $('#mina-state-proof-const').val(JSON.stringify(data)));

        fetch("https://raw.githubusercontent.com/NilFoundation/evm-mina-verification/master/share/mina/vk_9b0369c27bb85c8ab2f8725c6e977eb27b53b826.json")
            .then(result => result.json())
            .then(data => $('#mina-state-proof-vk').val(JSON.stringify(data)));
    });

    $($this).find("form").submit(function() {
        return false;
    });

    $(container).find(".input-block").not(".input-block input").on("click", function() {
        rescroll(this);
    });

    $(container).find(".input-block input").keypress(function(e) {
        if (e.which == 13) {
            if ($(this).hasClass("required") && $(this).val() == "") {

            } else {
                moveNext(this);
            }
        }
    });

    $(container).find('.input-block input[type="radio"].toggle-left').change(function(e) {
        moveNext(this);
    });

    $(container).find('.input-block input[type="radio"].toggle-right').change(function(e) {
        movePrev(this);
    });

    $(container).find('.input-block input[type="radio"].toggle-left').keypress(function(e) {
        if (e.which == 89) {
            $(this).change();
        }
    });

    $(container).find('.input-block input[type="radio"].toggle-right').keypress(function(e) {
        if (e.which == 78) {
            $(this).change();
        }
    });

    $(window).on("scroll", function() {
        $(container).find(".input-block").each(function() {
            var etop = $(this).offset().top;
            var diff = etop - $(window).scrollTop();

            if (diff > 100 && diff < 300) {
                reinitState(this);
            }
        });
    });

    function reinitState(e) {
        $(container).find('.input-block input[type="radio"].toggle-left').prop( "checked", false);
        $(container).find('.input-block input[type="radio"].toggle-right').prop( "checked", false);

        $(container).find(".input-block").removeClass("active");

        $(container).find(".input-block input").each(function() {
            $(this).blur();
        });
        $(e).addClass("active");
        /*$(e).find('input').focus();*/
    }

    function rescroll(e) {
        $(window).scrollTo($(e), 150, {
            offset: { left: 100, top: -150 },
            queue: false
        });
    }

    function reinit(e) {
        reinitState(e);
        rescroll(e);
    }

    function moveNext(e) {
        $(e).parent().parent().next().click();
    }

    function movePrev(e) {
        $(e).parent().parent().prev().click();
    }
};

$(".upform").upform();
