var GetOverlapY = require('./GetOverlapY');

/**
 * [description]
 *
 * @function Phaser.Physics.Arcade.SeparateY
 * @since 3.0.0
 *
 * @param {Phaser.Physics.Arcade.Body} body1 - [description]
 * @param {Phaser.Physics.Arcade.Body} body2 - [description]
 * @param {boolean} overlapOnly - [description]
 * @param {number} bias - [description]
 *
 * @return {boolean} [description]
 */
var SeparateY = function (body1, body2, overlapOnly, bias)
{
    var overlap = GetOverlapY(body1, body2, overlapOnly, bias);

    //  Can't separate two immovable bodies, or a body with its own custom separation logic
    if (overlapOnly || overlap === 0 || (body1.immovable && body2.immovable) || body1.customSeparateY || body2.customSeparateY)
    {
        //  return true if there was some overlap, otherwise false
        return (overlap !== 0) || (body1.embedded && body2.embedded);
    }

    //  Adjust their positions and velocities accordingly (if there was any overlap)
    var v1 = body1.velocity.y;
    var v2 = body2.velocity.y;

    if (!body1.immovable && !body2.immovable)
    {
        overlap *= 0.5;

        body1.y -= overlap;
        body2.y += overlap;

        var nv1 = Math.sqrt((v2 * v2 * body2.mass) / body1.mass) * ((v2 > 0) ? 1 : -1);
        var nv2 = Math.sqrt((v1 * v1 * body1.mass) / body2.mass) * ((v1 > 0) ? 1 : -1);
        var avg = (nv1 + nv2) * 0.5;

        nv1 -= avg;
        nv2 -= avg;

        body1.velocity.y = avg + nv1 * body1.bounce.y;
        body2.velocity.y = avg + nv2 * body2.bounce.y;
    }
    else if (!body1.immovable)
    {
        body1.y -= overlap;
        body1.velocity.y = v2 - v1 * body1.bounce.y;

        //  This is special case code that handles things like horizontal moving platforms you can ride
        if (body2.moves)
        {
            body1.x += (body2.x - body2.prev.x) * body2.friction.x;
        }
    }
    else
    {
        body2.y += overlap;
        body2.velocity.y = v1 - v2 * body2.bounce.y;

        //  This is special case code that handles things like horizontal moving platforms you can ride
        if (body1.moves)
        {
            body2.x += (body1.x - body1.prev.x) * body1.friction.x;
        }
    }

    //  If we got this far then there WAS overlap, and separation is complete, so return true
    return true;
};

module.exports = SeparateY;
